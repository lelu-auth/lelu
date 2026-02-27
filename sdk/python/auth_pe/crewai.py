"""
Lelu integration for CrewAI agents.

Provides ``LeluTool`` — a CrewAI-compatible tool base class that gates every
``_run()`` call through Lelu's Confidence-Aware Auth before execution.

Usage
-----
.. code-block:: python

    from crewai.tools import BaseTool
    from lelu.crewai import LeluTool
    from lelu import LeluClient

    client = LeluClient(base_url="http://localhost:8080")

    class RefundTool(LeluTool):
        name: str = "process_refund"
        description: str = "Process a customer refund by invoice ID."
        actor: str = "invoice_bot"
        action: str = "invoice:refund"
        confidence: float = 0.92  # set dynamically per-call if needed

        def _execute(self, invoice_id: str) -> str:
            # Your real tool logic here
            return f"Refund processed for invoice {invoice_id}"

    tool = RefundTool(lelu_client=client)

    # Use in a CrewAI agent
    from crewai import Agent, Task, Crew
    agent = Agent(role="Finance Bot", tools=[tool], ...)

Notes
-----
- ``_execute()`` is the method you override (not ``_run()``).
- If Lelu denies the action, ``_run()`` returns a structured refusal string
  that the LLM can use to self-correct.
- If the action requires human review, it is queued automatically and a
  pending message is returned.
- Set ``throw_on_deny=True`` to raise ``PermissionDeniedError`` instead.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from pydantic import Field

from .client import LeluClient
from .models import AgentAuthRequest, AgentContext

logger = logging.getLogger(__name__)

# ─── Attempt to import CrewAI ────────────────────────────────────────────────

try:
    from crewai.tools import BaseTool as CrewAIBaseTool  # type: ignore[import]

    _CREWAI_AVAILABLE = True
except ImportError:
    _CREWAI_AVAILABLE = False
    CrewAIBaseTool = object  # type: ignore[assignment,misc]


# ─── Exceptions ───────────────────────────────────────────────────────────────


class PermissionDeniedError(Exception):
    """Raised by LeluTool when ``throw_on_deny=True`` and Lelu denies."""

    def __init__(self, message: str, reason: str) -> None:
        super().__init__(message)
        self.reason = reason


# ─── LeluTool ────────────────────────────────────────────────────────────────


class LeluTool(CrewAIBaseTool):  # type: ignore[misc]
    """CrewAI ``BaseTool`` with Lelu Confidence-Aware Auth.

    Subclass this and implement ``_execute()`` instead of ``_run()``.
    Every call to ``_run()`` is intercepted and gated through Lelu first.

    Attributes
    ----------
    actor:
        The Lelu agent scope / actor name registered in your ``auth.yaml``.
    action:
        The permission string being checked (e.g. ``"invoice:refund"``).
    confidence:
        LLM confidence score for this invocation (0.0–1.0). Can be set
        dynamically before calling the tool.
    throw_on_deny:
        If ``True``, raise :class:`PermissionDeniedError` on denial.
        If ``False`` (default), return a structured refusal string for LLM
        self-correction.
    acting_for:
        Optional user ID the agent is acting on behalf of.
    """

    # Lelu-specific fields (Pydantic v2 model fields)
    actor: str = Field(..., description="Lelu agent actor / scope name")
    action: str = Field(..., description="Permission string to authorize")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="LLM confidence score")
    throw_on_deny: bool = Field(default=False, description="Raise on deny instead of returning refusal")
    acting_for: str | None = Field(default=None, description="User the agent acts on behalf of")

    # LeluClient is injected at construction time.
    model_config = {"arbitrary_types_allowed": True}
    _lelu: LeluClient

    def __init__(self, lelu_client: LeluClient, **data: Any) -> None:
        if not _CREWAI_AVAILABLE:
            raise ImportError(
                "crewai is not installed. Install it with: pip install crewai"
            )
        super().__init__(**data)
        self._lelu = lelu_client

    # ── Intercept CrewAI's _run ───────────────────────────────────────────────

    def _run(self, *args: Any, **kwargs: Any) -> str:
        """
        Gate the tool call through Lelu before executing ``_execute()``.
        Called by CrewAI's agent loop automatically.
        """
        try:
            decision = asyncio.run(
                self._lelu.agent_authorize(
                    AgentAuthRequest(
                        actor=self.actor,
                        action=self.action,
                        context=AgentContext(
                            confidence=self.confidence,
                            acting_for=self.acting_for,
                        ),
                    )
                )
            )
        except Exception as exc:  # noqa: BLE001
            msg = f"[Lelu] Authorization check failed for '{self.name}': {exc}"
            logger.error("lelu: %s", msg)
            if self.throw_on_deny:
                raise PermissionDeniedError(msg, str(exc)) from exc
            return msg

        # ── Human review required ──────────────────────────────────────────
        if decision.requires_human_review:
            logger.info(
                "lelu: tool=%s queued for human review reason=%r",
                self.name,
                decision.reason,
            )
            return (
                f"[Lelu] Action '{self.name}' is queued for human review. "
                f"Reason: {decision.reason}. Please wait for approval before retrying."
            )

        # ── Hard deny ─────────────────────────────────────────────────────
        if not decision.allowed:
            msg = (
                f"[Lelu] Action '{self.name}' was denied for agent '{self.actor}'. "
                f"Reason: {decision.reason}."
            )
            if decision.downgraded_scope:
                msg += f" Downgraded to: {decision.downgraded_scope}."
            logger.warning("lelu: %s", msg)
            if self.throw_on_deny:
                raise PermissionDeniedError(msg, decision.reason)
            return msg

        # ── Authorized — run the real tool ────────────────────────────────
        logger.debug(
            "lelu: tool=%s authorized confidence=%.2f trace_id=%s",
            self.name,
            decision.confidence_used,
            decision.trace_id,
        )
        return self._execute(*args, **kwargs)

    def _execute(self, *args: Any, **kwargs: Any) -> str:
        """Override this method with your actual tool logic."""
        raise NotImplementedError(
            f"LeluTool subclass '{type(self).__name__}' must implement _execute()"
        )
