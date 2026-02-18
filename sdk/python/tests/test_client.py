"""Tests for the Python SDK — PrismClient."""

from __future__ import annotations

import pytest
import httpx
from pytest_httpx import HTTPXMock

from auth_pe import (
    AgentAuthRequest,
    AgentContext,
    AuthEngineError,
    AuthRequest,
    MintTokenRequest,
    PrismClient,
)


# ─── Fixtures ─────────────────────────────────────────────────────────────────


@pytest.fixture
def client() -> PrismClient:
    return PrismClient(base_url="http://localhost:8080")


# ─── /v1/authorize ────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_authorize_allowed(client: PrismClient, httpx_mock: HTTPXMock) -> None:
    httpx_mock.add_response(
        method="POST",
        url="http://localhost:8080/v1/authorize",
        json={"allowed": True, "reason": "action allowed by role", "trace_id": "t1"},
    )
    dec = await client.authorize(AuthRequest(user_id="user_123", action="approve_refunds"))
    assert dec.allowed is True
    assert dec.trace_id == "t1"


@pytest.mark.asyncio
async def test_authorize_denied(client: PrismClient, httpx_mock: HTTPXMock) -> None:
    httpx_mock.add_response(
        method="POST",
        url="http://localhost:8080/v1/authorize",
        json={"allowed": False, "reason": "denied", "trace_id": "t2"},
    )
    dec = await client.authorize(AuthRequest(user_id="user_123", action="delete_invoices"))
    assert dec.allowed is False


@pytest.mark.asyncio
async def test_authorize_http_error(client: PrismClient, httpx_mock: HTTPXMock) -> None:
    httpx_mock.add_response(status_code=500, json={"error": "internal server error"})
    with pytest.raises(AuthEngineError) as exc_info:
        await client.authorize(AuthRequest(user_id="u", action="a"))
    assert exc_info.value.status == 500


# ─── /v1/agent/authorize ──────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_agent_authorize_full_confidence(client: PrismClient, httpx_mock: HTTPXMock) -> None:
    httpx_mock.add_response(
        method="POST",
        url="http://localhost:8080/v1/agent/authorize",
        json={
            "allowed": True,
            "reason": "action authorized",
            "trace_id": "t3",
            "requires_human_review": False,
            "confidence_used": 0.95,
        },
    )
    dec = await client.agent_authorize(
        AgentAuthRequest(
            actor="invoice_bot",
            action="approve_refunds",
            context=AgentContext(confidence=0.95, acting_for="user_123"),
        )
    )
    assert dec.allowed is True
    assert dec.requires_human_review is False
    assert dec.confidence_used == pytest.approx(0.95)


@pytest.mark.asyncio
async def test_agent_authorize_human_review(client: PrismClient, httpx_mock: HTTPXMock) -> None:
    httpx_mock.add_response(
        method="POST",
        url="http://localhost:8080/v1/agent/authorize",
        json={
            "allowed": False,
            "reason": "requires human approval",
            "trace_id": "t4",
            "requires_human_review": True,
            "confidence_used": 0.80,
        },
    )
    dec = await client.agent_authorize(
        AgentAuthRequest(
            actor="invoice_bot",
            action="approve_refunds",
            context=AgentContext(confidence=0.80),
        )
    )
    assert dec.requires_human_review is True


@pytest.mark.asyncio
async def test_agent_authorize_read_only_downgrade(client: PrismClient, httpx_mock: HTTPXMock) -> None:
    httpx_mock.add_response(
        method="POST",
        url="http://localhost:8080/v1/agent/authorize",
        json={
            "allowed": False,
            "reason": "downgraded",
            "trace_id": "t5",
            "downgraded_scope": "read_only",
            "requires_human_review": False,
            "confidence_used": 0.65,
        },
    )
    dec = await client.agent_authorize(
        AgentAuthRequest(
            actor="invoice_bot",
            action="approve_refunds",
            context=AgentContext(confidence=0.65),
        )
    )
    assert dec.downgraded_scope == "read_only"


def test_agent_context_validates_confidence_range() -> None:
    with pytest.raises(Exception):
        AgentContext(confidence=1.5)


# ─── /v1/tokens/mint ──────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_mint_token(client: PrismClient, httpx_mock: HTTPXMock) -> None:
    import time
    expires_at = int(time.time()) + 60
    httpx_mock.add_response(
        method="POST",
        url="http://localhost:8080/v1/tokens/mint",
        json={"token": "jwt.token.here", "token_id": "tid1", "expires_at": expires_at},
    )
    result = await client.mint_token(MintTokenRequest(scope="invoice_bot", acting_for="user_123"))
    assert result.token == "jwt.token.here"
    assert result.token_id == "tid1"


# ─── /v1/tokens/{id} DELETE ───────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_revoke_token(client: PrismClient, httpx_mock: HTTPXMock) -> None:
    httpx_mock.add_response(
        method="DELETE",
        url="http://localhost:8080/v1/tokens/tid1",
        json={"success": True},
    )
    result = await client.revoke_token("tid1")
    assert result.success is True


# ─── /healthz ─────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_is_healthy_true(client: PrismClient, httpx_mock: HTTPXMock) -> None:
    httpx_mock.add_response(
        url="http://localhost:8080/healthz",
        json={"status": "ok", "service": "auth-permission-engine"},
    )
    assert await client.is_healthy() is True


@pytest.mark.asyncio
async def test_is_healthy_false_on_error(client: PrismClient, httpx_mock: HTTPXMock) -> None:
    httpx_mock.add_exception(httpx.ConnectError("refused"))
    assert await client.is_healthy() is False


# ─── Context manager ──────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_context_manager(httpx_mock: HTTPXMock) -> None:
    httpx_mock.add_response(
        url="http://localhost:8080/healthz",
        json={"status": "ok"},
    )
    async with PrismClient() as prism:
        assert await prism.is_healthy() is True
