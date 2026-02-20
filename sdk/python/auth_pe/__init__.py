"""
auth_pe — Python SDK for the Auth Permission Engine.

Quick start::

    from auth_pe import PrismClient, AgentAuthRequest, AgentContext

    async with PrismClient(base_url="http://localhost:8080") as prism:
        decision = await prism.agent_authorize(
            AgentAuthRequest(
                actor="invoice_bot",
                action="approve_refunds",
                context=AgentContext(confidence=0.92, acting_for="user_123"),
            )
        )
        if not decision.allowed:
            print(decision.reason)
"""

from .client import PrismClient
from .autogpt_plugin import PrismAutoGPTPlugin
from .models import (
    AgentAuthDecision,
    AgentAuthRequest,
    AgentContext,
    AuthDecision,
    AuthEngineError,
    AuthRequest,
    MintTokenRequest,
    MintTokenResult,
    RevokeTokenResult,
)

__all__ = [
    "PrismClient",
    "PrismAutoGPTPlugin",
    # Requests
    "AuthRequest",
    "AgentAuthRequest",
    "AgentContext",
    "MintTokenRequest",
    # Decisions
    "AuthDecision",
    "AgentAuthDecision",
    "MintTokenResult",
    "RevokeTokenResult",
    # Errors
    "AuthEngineError",
]

__version__ = "0.1.0"
