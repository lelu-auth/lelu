"""AutoGPT plugin scaffold for Prism Auth Permission Engine."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .client import LeluClient
from .models import AgentAuthRequest, AgentContext


@dataclass(slots=True)
class PrismAutoGPTPlugin:
    """
    Minimal plugin helper for AutoGPT-style tool execution guards.

    This is framework-agnostic so it can be plugged into different AutoGPT
    runtimes without requiring a hard dependency.
    """

    client: LeluClient
    actor: str

    async def can_execute(
        self,
        action: str,
        *,
        confidence: float,
        acting_for: str = "",
        scope: str = "",
        resource: dict[str, Any] | None = None,
    ) -> tuple[bool, str]:
        req = AgentAuthRequest(
            actor=self.actor,
            action=action,
            resource=resource or {},
            context=AgentContext(
                confidence=confidence,
                acting_for=acting_for,
                scope=scope,
            ),
        )
        decision = await self.client.agent_authorize(req)
        return decision.allowed, decision.reason

    async def enforce(
        self,
        action: str,
        *,
        confidence: float,
        acting_for: str = "",
        scope: str = "",
        resource: dict[str, Any] | None = None,
    ) -> None:
        allowed, reason = await self.can_execute(
            action,
            confidence=confidence,
            acting_for=acting_for,
            scope=scope,
            resource=resource,
        )
        if not allowed:
            raise PermissionError(reason)
