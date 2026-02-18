"""Auth Permission Engine — Python SDK models (Pydantic v2)."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator


# ─── Requests ─────────────────────────────────────────────────────────────────


class AuthRequest(BaseModel):
    """Human authorization check."""

    user_id: str = Field(..., min_length=1, description="Requesting user ID")
    action: str = Field(..., min_length=1, description="Action to authorize")
    resource: dict[str, str] | None = Field(default=None, description="Target resource")


class AgentContext(BaseModel):
    """LLM agent context, including confidence score."""

    confidence: float = Field(..., ge=0.0, le=1.0, description="LLM confidence score (0–1)")
    acting_for: str | None = Field(default=None, description="User the agent acts on behalf of")
    scope: str | None = Field(default=None, description="Requested agent scope")

    @field_validator("confidence")
    @classmethod
    def validate_confidence(cls, v: float) -> float:
        if not 0.0 <= v <= 1.0:
            raise ValueError(f"confidence must be between 0 and 1, got {v}")
        return v


class AgentAuthRequest(BaseModel):
    """Agent authorization check with confidence-aware gate."""

    actor: str = Field(..., min_length=1, description="Agent identifier")
    action: str = Field(..., min_length=1, description="Action to authorize")
    resource: dict[str, str] | None = Field(default=None)
    context: AgentContext


class MintTokenRequest(BaseModel):
    """JIT token minting request."""

    scope: str = Field(..., min_length=1)
    acting_for: str | None = None
    ttl_seconds: int | None = Field(default=None, gt=0)


# ─── Decisions ────────────────────────────────────────────────────────────────


class AuthDecision(BaseModel):
    """Result of a human authorization check."""

    allowed: bool
    reason: str
    trace_id: str


class AgentAuthDecision(BaseModel):
    """Result of an agent authorization check."""

    allowed: bool
    reason: str
    trace_id: str
    downgraded_scope: str | None = None
    requires_human_review: bool = False
    confidence_used: float = 0.0


class MintTokenResult(BaseModel):
    """JIT token minting result."""

    token: str
    token_id: str
    expires_at: datetime


class RevokeTokenResult(BaseModel):
    """Token revocation result."""

    success: bool


# ─── Errors ───────────────────────────────────────────────────────────────────


class AuthEngineError(Exception):
    """Raised when the Auth Permission Engine returns an error response."""

    def __init__(self, message: str, status: int | None = None, details: Any = None) -> None:
        super().__init__(message)
        self.status = status
        self.details = details

    def __repr__(self) -> str:
        return f"AuthEngineError(message={self!s!r}, status={self.status})"
