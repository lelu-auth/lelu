"""
Prism Python SDK.

Quick start::

    from lelu import LeluClient, AgentAuthRequest, AgentContext

    async with LeluClient(base_url="http://localhost:8080") as lelu:
        decision = await lelu.agent_authorize(
            AgentAuthRequest(
                actor="invoice_bot",
                action="approve_refunds",
                context=AgentContext(confidence=0.92, acting_for="user_123"),
            )
        )
        if not decision.allowed:
            print(decision.reason)
"""

from .client import LeluClient
from .autogpt_plugin import PrismAutoGPTPlugin
from .middleware import AgentMiddleware
from .models import (
    AgentAuthDecision,
    AgentAuthRequest,
    AgentContext,
    AuthDecision,
    AuthEngineError,
    AuthRequest,
    DelegateScopeRequest,
    DelegateScopeResult,
    MintTokenRequest,
    MintTokenResult,
    RevokeTokenResult,
)

# CrewAI integration — requires `pip install crewai`
try:
    from .crewai import PrismTool, PermissionDeniedError as CrewAIPermissionDeniedError  # noqa: F401
except ImportError:
    pass  # crewai not installed; PrismTool not available

__all__ = [
    "LeluClient",
    "PrismAutoGPTPlugin",
    "AgentMiddleware",
    # CrewAI
    "PrismTool",
    "CrewAIPermissionDeniedError",
    # Requests
    "AuthRequest",
    "AgentAuthRequest",
    "AgentContext",
    "MintTokenRequest",
    "DelegateScopeRequest",
    # Decisions
    "AuthDecision",
    "AgentAuthDecision",
    "MintTokenResult",
    "DelegateScopeResult",
    "RevokeTokenResult",
    # Errors
    "AuthEngineError",
]

__version__ = "0.1.0"
