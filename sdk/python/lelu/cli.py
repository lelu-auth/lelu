#!/usr/bin/env python3
"""Lelu CLI for viewing audit logs and managing policies."""

import asyncio
import os
import sys
from datetime import datetime
from typing import Optional

import httpx

from auth_pe.client import LeluClient
from auth_pe.storage import LocalStorage
from auth_pe.models import (
    ListAuditEventsRequest,
    ListPoliciesRequest,
    GetPolicyRequest,
    UpsertPolicyRequest,
    DeletePolicyRequest,
)


def print_help() -> None:
    """Print CLI help information."""
    print("""
Lelu CLI

Usage:
  lelu audit-log         View recent audit events
  lelu policies          Manage authorization policies
  lelu help              Show this help

Commands:
  audit-log              View audit trail and authorization events
  policies list          List all policies
  policies get <name>    Get a specific policy
  policies set <name> <file>  Create or update a policy from file
  policies delete <name> Delete a policy

Storage:
  Default: Local SQLite (~/.lelu/lelu.db)
  Remote:  Set LELU_PLATFORM_URL environment variable

Environment Variables:
  LELU_PLATFORM_URL       Platform API URL (uses local SQLite if not set)
  LELU_PLATFORM_API_KEY   Platform API key (default: platform-dev-key)
  LELU_TENANT_ID          Tenant ID (default: default)
  LELU_AUDIT_LIMIT        Number of events to fetch (default: 20)

Examples:
  lelu audit-log                              # View from local storage
  lelu policies list                          # List from local storage
  lelu policies set auth ./auth.rego          # Save to local storage
  LELU_PLATFORM_URL=https://lelu.example.com lelu audit-log  # Use remote
""")


async def show_audit_log() -> None:
    """Fetch and display audit events."""
    platform_url = os.getenv("LELU_PLATFORM_URL")
    limit = int(os.getenv("LELU_AUDIT_LIMIT", "20"))
    
    # Priority: 1. Platform URL, 2. Local SQLite
    if platform_url:
        await show_audit_log_platform(platform_url, limit)
    else:
        show_audit_log_local(limit)


async def show_audit_log_platform(platform_url: str, limit: int) -> None:
    """Fetch audit log from platform service."""
    api_key = os.getenv("LELU_PLATFORM_API_KEY", "platform-dev-key")
    
    print(f"🌐 Using platform: {platform_url}")
    print("")
    
    async with LeluClient(base_url=platform_url, api_key=api_key) as lelu:
        try:
            # Check if service is reachable
            try:
                health_response = await lelu._client.get("/healthz", timeout=3.0)
                if health_response.status_code != 200:
                    raise httpx.HTTPError("Service not healthy")
            except (httpx.HTTPError, httpx.ConnectError, httpx.TimeoutException):
                print("❌ Lelu platform service is not reachable")
                print("")
                print("💡 Falling back to local SQLite storage...")
                print("   Unset LELU_PLATFORM_URL to use local storage by default")
                print("")
                show_audit_log_local(limit)
                return
            
            result = await lelu.list_audit_events(ListAuditEventsRequest(limit=limit))
            display_audit_events(result.events, result.count, limit, result.next_cursor, "platform")
                
        except Exception as e:
            print(f"❌ Error fetching from platform: {e}")
            sys.exit(1)


def show_audit_log_local(limit: int) -> None:
    """Fetch audit log from local SQLite storage."""
    with LocalStorage() as storage:
        print(f"[Local] Using storage: {storage.get_db_path()}")
        print("")
        
        result = storage.list_audit_events(limit=limit)
        
        if not result["events"]:
            print("📋 No audit events found in local storage.")
            print("")
            print("This could mean:")
            print("- No authorization requests have been logged yet")
            print("- Audit events are stored in a remote platform")
            print("")
            print("💡 To use remote platform:")
            print("   LELU_PLATFORM_URL=https://your-platform.com lelu audit-log")
            return
        
        display_audit_events(
            result["events"],
            result["count"],
            limit,
            result["next_cursor"],
            "local"
        )


def display_audit_events(events, count, limit, next_cursor, source):
    """Display audit events in a formatted way."""
    print(f"📊 Audit Log ({count} events, limit: {limit}) [{source}]")
    print("─" * 80)
    
    for event in events:
        if isinstance(event, dict):
            timestamp = event["timestamp"]
            actor = event["actor"]
            action = event["action"]
            decision = event["decision"]
            confidence_score = event.get("confidence_score")
            reason = event.get("reason")
            downgraded_scope = event.get("downgraded_scope")
            trace_id = event["trace_id"]
            resource = event.get("resource")
        else:
            timestamp = event.timestamp
            actor = event.actor
            action = event.action
            decision = event.decision
            confidence_score = event.confidence_score
            reason = event.reason
            downgraded_scope = event.downgraded_scope
            trace_id = event.trace_id
            resource = event.resource
        
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            formatted_time = dt.strftime("%Y-%m-%d %H:%M:%S UTC")
        except:
            formatted_time = timestamp
        
        confidence = f" (confidence: {confidence_score:.2f})" if confidence_score else ""
        resource_str = f" on {resource}" if resource else ""
        
        print(f"[{formatted_time}] {actor} → {action}{resource_str}")
        print(f"  Decision: {decision}{confidence}")
        if reason:
            print(f"  Reason: {reason}")
        if downgraded_scope:
            print(f"  Downgraded scope: {downgraded_scope}")
        print(f"  Trace ID: {trace_id}")
        print()
    
    if next_cursor > 0:
        print(f"📄 Use cursor {next_cursor} to fetch more events.")


async def show_policies() -> None:
    """Handle policies subcommands."""
    platform_url = os.getenv("LELU_PLATFORM_URL")
    
    if len(sys.argv) < 3:
        print("❌ Policies command is required")
        print("")
        print("Available commands:")
        print("  lelu policies list          List all policies")
        print("  lelu policies get <name>    Get a specific policy")
        print("  lelu policies set <name> <file>  Create or update a policy")
        print("  lelu policies delete <name> Delete a policy")
        sys.exit(1)
    
    subcommand = sys.argv[2]
    
    # Priority: 1. Platform URL, 2. Local SQLite
    if platform_url:
        await show_policies_platform(platform_url, subcommand)
    else:
        show_policies_local(subcommand)


async def show_policies_platform(platform_url: str, subcommand: str) -> None:
    """Manage policies on platform service."""
    api_key = os.getenv("LELU_PLATFORM_API_KEY", "platform-dev-key")
    tenant_id = os.getenv("LELU_TENANT_ID", "default")
    
    print(f"🌐 Using platform: {platform_url}")
    print("")
    
    async with LeluClient(base_url=platform_url, api_key=api_key) as lelu:
        try:
            # Check if service is reachable
            try:
                health_response = await lelu._client.get("/healthz", timeout=3.0)
                if health_response.status_code != 200:
                    raise httpx.HTTPError("Service not healthy")
            except (httpx.HTTPError, httpx.ConnectError, httpx.TimeoutException):
                print("❌ Lelu platform service is not reachable")
                print("")
                print("💡 Falling back to local SQLite storage...")
                print("   Unset LELU_PLATFORM_URL to use local storage by default")
                print("")
                show_policies_local(subcommand)
                return
            
            if subcommand == "list":
                result = await lelu.list_policies(ListPoliciesRequest(tenant_id=tenant_id))
                display_policies_list(result.policies, result.count, "platform")
            elif subcommand == "get":
                if len(sys.argv) < 4:
                    print("❌ Policy name is required")
                    print("Usage: lelu policies get <name>")
                    sys.exit(1)
                policy_name = sys.argv[3]
                policy = await lelu.get_policy(GetPolicyRequest(name=policy_name, tenant_id=tenant_id))
                display_policy_detail(policy, "platform")
            elif subcommand == "set":
                if len(sys.argv) < 5:
                    print("❌ Policy name and file path are required")
                    print("Usage: lelu policies set <name> <file>")
                    sys.exit(1)
                policy_name = sys.argv[3]
                file_path = sys.argv[4]
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                policy = await lelu.upsert_policy(UpsertPolicyRequest(
                    name=policy_name,
                    content=content,
                    tenant_id=tenant_id
                ))
                print(f'✅ Policy "{policy_name}" saved to platform')
            elif subcommand == "delete":
                if len(sys.argv) < 4:
                    print("❌ Policy name is required")
                    print("Usage: lelu policies delete <name>")
                    sys.exit(1)
                policy_name = sys.argv[3]
                result = await lelu.delete_policy(DeletePolicyRequest(name=policy_name, tenant_id=tenant_id))
                if result.deleted:
                    print(f'✅ Policy "{policy_name}" deleted from platform')
                else:
                    print(f'❌ Failed to delete policy "{policy_name}"')
            else:
                print(f"❌ Unknown subcommand: {subcommand}")
                sys.exit(1)
                
        except Exception as e:
            print(f"❌ Error: {e}")
            sys.exit(1)


def show_policies_local(subcommand: str) -> None:
    """Manage policies in local SQLite storage."""
    with LocalStorage() as storage:
        print(f"[Local] Using storage: {storage.get_db_path()}")
        print("")
        
        if subcommand == "list":
            policies = storage.list_policies()
            if not policies:
                print("📋 No policies found in local storage.")
                print("")
                print("💡 Add a policy:")
                print("   lelu policies set my-policy policy.rego")
                return
            display_policies_list(policies, len(policies), "local")
        elif subcommand == "get":
            if len(sys.argv) < 4:
                print("❌ Policy name is required")
                print("Usage: lelu policies get <name>")
                sys.exit(1)
            policy_name = sys.argv[3]
            policy = storage.get_policy(policy_name)
            if not policy:
                print(f'❌ Policy "{policy_name}" not found')
                sys.exit(1)
            display_policy_detail(policy, "local")
        elif subcommand == "set":
            if len(sys.argv) < 5:
                print("❌ Policy name and file path are required")
                print("Usage: lelu policies set <name> <file>")
                sys.exit(1)
            policy_name = sys.argv[3]
            file_path = sys.argv[4]
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            storage.upsert_policy(policy_name, content)
            print(f'✅ Policy "{policy_name}" saved to local storage')
        elif subcommand == "delete":
            if len(sys.argv) < 4:
                print("❌ Policy name is required")
                print("Usage: lelu policies delete <name>")
                sys.exit(1)
            policy_name = sys.argv[3]
            deleted = storage.delete_policy(policy_name)
            if deleted:
                print(f'✅ Policy "{policy_name}" deleted from local storage')
            else:
                print(f'⚠️  Policy "{policy_name}" not found')
        else:
            print(f"❌ Unknown subcommand: {subcommand}")
            sys.exit(1)


def display_policies_list(policies, count, source):
    """Display list of policies."""
    print(f"📜 Policies ({count} total) [{source}]")
    print("─" * 80)
    
    for policy in policies:
        if isinstance(policy, dict):
            name = policy["name"]
            version = policy["version"]
            created_at = policy["created_at"]
            updated_at = policy["updated_at"]
            hmac = policy["hmac_sha256"]
        else:
            name = policy.name
            version = policy.version
            created_at = policy.created_at
            updated_at = policy.updated_at
            hmac = policy.hmac_sha256
        
        print(f"\n{name} (v{version})")
        try:
            created_dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            updated_dt = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
            print(f"  Created: {created_dt.strftime('%Y-%m-%d %H:%M:%S UTC')}")
            print(f"  Updated: {updated_dt.strftime('%Y-%m-%d %H:%M:%S UTC')}")
        except:
            print(f"  Created: {created_at}")
            print(f"  Updated: {updated_at}")
        print(f"  HMAC: {hmac[:16]}...")


def display_policy_detail(policy, source):
    """Display detailed policy information."""
    if isinstance(policy, dict):
        name = policy["name"]
        version = policy["version"]
        content = policy["content"]
    else:
        name = policy.name
        version = policy.version
        content = policy.content
    
    print(f"📜 Policy: {name} (v{version}) [{source}]")
    print("─" * 80)
    print(content)


def main() -> None:
    """Main CLI entry point."""
    command = sys.argv[1] if len(sys.argv) > 1 else "help"
    
    if command in ("help", "-h", "--help"):
        print_help()
        return
    
    if command == "audit-log":
        asyncio.run(show_audit_log())
        return
    
    if command == "policies":
        asyncio.run(show_policies())
        return
    
    print(f"Unknown command: {command}")
    print_help()
    sys.exit(1)


if __name__ == "__main__":
    main()
