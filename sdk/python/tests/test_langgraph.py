"""Tests for the LangGraph secure_node decorator."""
import pytest
from unittest.mock import AsyncMock, MagicMock

from auth_pe.langgraph import (
    secure_node,
    PermissionDeniedError,
    was_denied,
    pending_review,
    denial_reason,
)
from auth_pe.models import AgentAuthDecision


def _mock_client(*, allowed: bool, requires_review: bool = False, reason: str = "ok") -> MagicMock:
    """Return a mock LeluClient whose agent_authorize returns the given decision."""
    decision = AgentAuthDecision(
        allowed=allowed,
        reason=reason,
        trace_id="trace-test",
        requires_human_review=requires_review,
        confidence_used=0.85,
        downgraded_scope=None,
    )
    client = MagicMock()
    client.agent_authorize = AsyncMock(return_value=decision)
    # Support async context manager usage
    client.__aenter__ = AsyncMock(return_value=client)
    client.__aexit__ = AsyncMock(return_value=None)
    return client


@pytest.mark.asyncio
async def test_secure_node_allowed():
    client = _mock_client(allowed=True)

    @secure_node(client=client, actor="invoice_bot", action="invoice:approve")
    async def my_node(state: dict) -> dict:
        return {**state, "result": "done"}

    result = await my_node({"confidence": 0.95})
    assert result["result"] == "done"
    assert result.get("lelu_denied") is False


@pytest.mark.asyncio
async def test_secure_node_denied_silent():
    client = _mock_client(allowed=False, reason="low confidence")

    @secure_node(client=client, actor="invoice_bot", action="invoice:approve")
    async def my_node(state: dict) -> dict:
        pytest.fail("should not execute when denied")

    result = await my_node({"confidence": 0.4})
    assert was_denied(result) is True
    assert pending_review(result) is False
    assert denial_reason(result) == "low confidence"


@pytest.mark.asyncio
async def test_secure_node_denied_throw():
    client = _mock_client(allowed=False, reason="policy violation")

    @secure_node(client=client, actor="invoice_bot", action="invoice:approve", throw_on_deny=True)
    async def my_node(state: dict) -> dict:
        pytest.fail("should not execute")

    with pytest.raises(PermissionDeniedError) as exc_info:
        await my_node({"confidence": 0.4})
    assert exc_info.value.reason == "policy violation"


@pytest.mark.asyncio
async def test_secure_node_requires_human_review():
    client = _mock_client(allowed=False, requires_review=True, reason="needs approval")

    @secure_node(client=client, actor="invoice_bot", action="invoice:approve")
    async def my_node(state: dict) -> dict:
        pytest.fail("should not execute when queued for review")

    result = await my_node({"confidence": 0.75})
    assert was_denied(result) is True
    assert pending_review(result) is True
    assert denial_reason(result) == "needs approval"


@pytest.mark.asyncio
async def test_secure_node_default_confidence():
    """When confidence_key is missing, default_confidence is used."""
    client = _mock_client(allowed=True)

    @secure_node(
        client=client,
        actor="bot",
        action="do:thing",
        default_confidence=0.99,
    )
    async def my_node(state: dict) -> dict:
        return state

    result = await my_node({})  # no "confidence" key
    assert not was_denied(result)
    # Verify the call used 0.99
    call_args = client.agent_authorize.call_args[0][0]
    assert call_args.context.confidence == 0.99
