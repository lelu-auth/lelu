#!/usr/bin/env python3
"""Lelu CLI for viewing audit logs and other utilities."""

import asyncio
import os
import sys
from datetime import datetime
from typing import Optional

import httpx

from auth_pe.client import LeluClient
from auth_pe.models import ListAuditEventsRequest


def print_help() -> None:
    """Print CLI help information."""
    print("""
Lelu CLI

Usage:
  lelu audit-log       View recent audit events from the platform
  lelu help            Show this help

Environment Variables:
  LELU_PLATFORM_URL   Platform API URL (default: http://localhost:3001)
  LELU_AUDIT_LIMIT    Number of events to fetch (default: 20)

Examples:
  lelu audit-log                                    # View recent audit events
  LELU_AUDIT_LIMIT=50 lelu audit-log               # View 50 recent events
  LELU_PLATFORM_URL=https://api.example.com lelu audit-log  # Use custom platform URL
""")


async def show_audit_log() -> None:
    """Fetch and display audit events."""
    base_url = os.getenv("LELU_PLATFORM_URL", "http://localhost:3001")
    limit = int(os.getenv("LELU_AUDIT_LIMIT", "20"))
    
    print(f"Fetching audit log from {base_url}...")
    
    async with LeluClient(base_url=base_url) as lelu:
        try:
            result = await lelu.list_audit_events(
                ListAuditEventsRequest(limit=limit)
            )
            
            if not result.events:
                print("No audit events found.")
                return
            
            print(f"\nAudit Log ({result.count} events, limit: {limit})")
            print("─" * 80)
            
            for event in result.events:
                timestamp = datetime.fromisoformat(event.timestamp.replace('Z', '+00:00'))
                formatted_time = timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")
                
                confidence = f" (confidence: {event.confidence_score:.2f})" if event.confidence_score else ""
                resource = f" on {event.resource}" if event.resource else ""
                
                print(f"[{formatted_time}] {event.actor} → {event.action}{resource}")
                print(f"  Decision: {event.decision}{confidence}")
                if event.reason:
                    print(f"  Reason: {event.reason}")
                if event.downgraded_scope:
                    print(f"  Downgraded scope: {event.downgraded_scope}")
                print(f"  Trace ID: {event.trace_id}")
                print()
            
            if result.next_cursor > 0:
                print(f"Use cursor {result.next_cursor} to fetch more events.")
                
        except httpx.HTTPError as e:
            print(f"Error fetching audit log: {e}")
            print("\nTroubleshooting:")
            print("- Ensure the Lelu platform service is running")
            print("- Check the platform URL (default: http://localhost:3001)")
            print("- Verify your network connection")
            sys.exit(1)
        except Exception as e:
            print(f"Error fetching audit log: {e}")
            sys.exit(1)


def main() -> None:
    """Main CLI entry point."""
    command = sys.argv[1] if len(sys.argv) > 1 else "audit-log"
    
    if command in ("help", "-h", "--help"):
        print_help()
        return
    
    if command == "audit-log":
        asyncio.run(show_audit_log())
        return
    
    print(f"Unknown command: {command}")
    print_help()
    sys.exit(1)


if __name__ == "__main__":
    main()