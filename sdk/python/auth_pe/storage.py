"""Local SQLite storage for audit logs and policies."""

from __future__ import annotations

import hashlib
import json
import sqlite3
import time
from pathlib import Path
from typing import Any

from .models import AuditEvent, Policy


class LocalStorage:
    """
    LocalStorage provides SQLite-based local storage for audit logs and policies.
    Automatically creates ~/.lelu/lelu.db on first use.
    """

    def __init__(self, db_path: str | None = None):
        """Initialize local storage with SQLite database."""
        if db_path is None:
            lelu_dir = Path.home() / ".lelu"
            lelu_dir.mkdir(parents=True, exist_ok=True)
            db_path = str(lelu_dir / "lelu.db")

        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self._initialize()

    def _initialize(self) -> None:
        """Create tables if they don't exist."""
        self.conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS audit_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tenant_id TEXT NOT NULL DEFAULT 'default',
                trace_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                actor TEXT NOT NULL,
                action TEXT NOT NULL,
                resource TEXT,
                confidence_score REAL,
                decision TEXT NOT NULL,
                reason TEXT,
                downgraded_scope TEXT,
                latency_ms REAL,
                engine_version TEXT,
                policy_version TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_audit_tenant_trace 
                ON audit_events(tenant_id, trace_id);
            CREATE INDEX IF NOT EXISTS idx_audit_tenant_actor 
                ON audit_events(tenant_id, actor, timestamp DESC);
            CREATE INDEX IF NOT EXISTS idx_audit_tenant_ts 
                ON audit_events(tenant_id, timestamp DESC);

            CREATE TABLE IF NOT EXISTS policies (
                id TEXT PRIMARY KEY,
                tenant_id TEXT NOT NULL DEFAULT 'default',
                name TEXT NOT NULL,
                content TEXT NOT NULL,
                version TEXT NOT NULL DEFAULT '1.0',
                hmac_sha256 TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(tenant_id, name)
            );
            """
        )
        self.conn.commit()

    # ─── Audit Events ─────────────────────────────────────────────────────────

    def insert_audit_event(self, event: dict[str, Any]) -> None:
        """Insert an audit event into local storage."""
        cursor = self.conn.cursor()
        cursor.execute(
            """
            INSERT INTO audit_events (
                tenant_id, trace_id, timestamp, actor, action, resource,
                confidence_score, decision, reason, downgraded_scope,
                latency_ms, engine_version, policy_version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event.get("tenant_id", "default"),
                event["trace_id"],
                event["timestamp"],
                event["actor"],
                event["action"],
                json.dumps(event["resource"]) if event.get("resource") else None,
                event.get("confidence_score"),
                event["decision"],
                event.get("reason"),
                event.get("downgraded_scope"),
                event.get("latency_ms"),
                event.get("engine_version"),
                event.get("policy_version"),
            ),
        )
        self.conn.commit()

    def list_audit_events(
        self,
        tenant_id: str = "default",
        limit: int = 20,
        cursor: int = 0,
        actor: str | None = None,
    ) -> dict[str, Any]:
        """List audit events from local storage."""
        query = """
            SELECT * FROM audit_events
            WHERE tenant_id = ? AND id > ?
        """
        params: list[Any] = [tenant_id, cursor]

        if actor:
            query += " AND actor = ?"
            params.append(actor)

        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)

        db_cursor = self.conn.cursor()
        db_cursor.execute(query, params)
        rows = db_cursor.fetchall()

        events = []
        for row in rows:
            event = {
                "id": row["id"],
                "tenant_id": row["tenant_id"],
                "trace_id": row["trace_id"],
                "timestamp": row["timestamp"],
                "actor": row["actor"],
                "action": row["action"],
                "resource": json.loads(row["resource"]) if row["resource"] else None,
                "confidence_score": row["confidence_score"],
                "decision": row["decision"],
                "reason": row["reason"],
                "downgraded_scope": row["downgraded_scope"],
                "latency_ms": row["latency_ms"],
                "engine_version": row["engine_version"],
                "policy_version": row["policy_version"],
            }
            events.append(event)

        next_cursor = events[-1]["id"] if events else cursor

        db_cursor.execute(
            "SELECT COUNT(*) as count FROM audit_events WHERE tenant_id = ?",
            (tenant_id,),
        )
        count_result = db_cursor.fetchone()
        count = count_result["count"] if count_result else 0

        return {"events": events, "count": count, "next_cursor": next_cursor}

    # ─── Policies ─────────────────────────────────────────────────────────────

    def list_policies(self, tenant_id: str = "default") -> list[dict[str, Any]]:
        """List all policies from local storage."""
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT * FROM policies WHERE tenant_id = ? ORDER BY name", (tenant_id,)
        )
        rows = cursor.fetchall()

        policies = []
        for row in rows:
            policy = {
                "id": row["id"],
                "tenant_id": row["tenant_id"],
                "name": row["name"],
                "content": row["content"],
                "version": row["version"],
                "hmac_sha256": row["hmac_sha256"],
                "created_at": row["created_at"],
                "updated_at": row["updated_at"],
            }
            policies.append(policy)

        return policies

    def get_policy(
        self, name: str, tenant_id: str = "default"
    ) -> dict[str, Any] | None:
        """Get a specific policy from local storage."""
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT * FROM policies WHERE tenant_id = ? AND name = ?",
            (tenant_id, name),
        )
        row = cursor.fetchone()

        if not row:
            return None

        return {
            "id": row["id"],
            "tenant_id": row["tenant_id"],
            "name": row["name"],
            "content": row["content"],
            "version": row["version"],
            "hmac_sha256": row["hmac_sha256"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }

    def upsert_policy(
        self,
        name: str,
        content: str,
        version: str = "1.0",
        tenant_id: str = "default",
    ) -> None:
        """Create or update a policy in local storage."""
        hmac_sha256 = hashlib.sha256(content.encode()).hexdigest()
        policy_id = f"{int(time.time() * 1000)}-{hash(name) % 1000000}"

        cursor = self.conn.cursor()
        cursor.execute(
            """
            INSERT INTO policies (id, tenant_id, name, content, version, hmac_sha256, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(tenant_id, name) DO UPDATE SET
                content = excluded.content,
                version = excluded.version,
                hmac_sha256 = excluded.hmac_sha256,
                updated_at = CURRENT_TIMESTAMP
            """,
            (policy_id, tenant_id, name, content, version, hmac_sha256),
        )
        self.conn.commit()

    def delete_policy(self, name: str, tenant_id: str = "default") -> bool:
        """Delete a policy from local storage."""
        cursor = self.conn.cursor()
        cursor.execute(
            "DELETE FROM policies WHERE tenant_id = ? AND name = ?", (tenant_id, name)
        )
        self.conn.commit()
        return cursor.rowcount > 0

    # ─── Utilities ────────────────────────────────────────────────────────────

    def close(self) -> None:
        """Close the database connection."""
        self.conn.close()

    def get_db_path(self) -> str:
        """Get the database file path."""
        return self.db_path

    def __enter__(self):
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()
