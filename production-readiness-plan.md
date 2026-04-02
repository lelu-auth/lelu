# Prism Production-Readiness Plan

## Context
- Authorization flow docs: AUTHORIZATION_FLOW.md
- Data and infra flow: DATA_FLOW_COMPLETE.md
- Language baselines: Go 1.23 (engine, platform, Go SDK), TypeScript ~5.4 (SDKs, UI), Python ≥3.11 (Python SDK), Node ≥18

## Objectives
- Ship a secure, reliable, and observable authorization platform for both human and AI-agent requests.
- Protect audit integrity, enforce least privilege, and keep latency predictable under load.
- Standardize SDK behavior and release hygiene across Go, TS, and Python.

## Phase 0 — Assessment (1 week)
- Confirm SLIs/SLOs: p99 latency, error budget, decision throughput, Redis/Postgres/Redis hit rates.
- Run threat model on authorization + delegation flows (prompt injection, replay, key theft, policy bypass).
- Inventory secrets/keys (API keys, signing keys, DB creds); document storage/rotation approach.
- Map data classes and retention (audit, policies, keys, user data) to compliance needs.

## Phase 1 — Foundations (2–3 weeks)
- **Security**
  - Enforce HTTPS/mTLS between services; require TLS to Redis/Postgres; rotate API key salts/signing keys with KMS.
  - Add key rotation and revocation endpoints + background sweep for stale keys.
  - Require per-tenant rate limits (distinct from IP) and idempotency keys for client retries.
  - Validate request schemas with strict typing (zod/Pydantic) and reject unknown fields.
  - Harden prompt-injection detector with rules + telemetry; add allow/deny lists per tenant.
- **Data**
  - Add migrations + schema validation for Postgres/SQLite; backup/restore runbook + PITR tests.
  - Encrypt sensitive fields at rest (Postgres) and in transit; consider envelope encryption for audit payloads.
  - Define retention/TTL for audit, cache, and policy artifacts; add compaction jobs.
- **Reliability**
  - Circuit breakers + exponential backoff for Redis/Postgres calls; connection pool tuning.
  - Health checks: liveness, readiness, and dependency probes per service (engine, platform, UI).
  - Graceful shutdown with in-flight request draining and audit flush.
- **Observability**
  - Standardize OTEL tracer/service names; propagate trace IDs in all responses (including SDKs).
  - Emit structured logs with redaction; ship to a central sink; set log sampling for high-volume paths.
  - Baseline dashboards: request volume, decision mix (allow/review/deny), latency, rate-limit events, injection detections.

## Phase 2 — Hardening (2–3 weeks)
- **Policy & Risk**: Add policy unit tests and golden files; fuzz policies with synthetic actors/actions; simulate delegation chains.
- **Auditing**: Tamper-evident audit logs (hash chain or SigV4-style signatures) and access controls for reviewers.
- **SDKs**: Align retry/backoff and timeout defaults; add offline cache eviction policies; improve typed error taxonomy.
- **Performance**: Load tests for /v1/authorize and /v1/agent/authorize across percentiles; profile Redis/Postgres hot paths; cache policy artifacts.
- **Compliance**: Document DPIA-style data map; add DSR hooks (export/delete) for audit data where legally required.

## Phase 3 — Scale & Operate (ongoing)
- Auto-scaling policies tuned to SLOs; capacity tests each release.
- Chaos drills: Redis/Postgres outage, elevated latency, partial packet loss, and SDK offline mode.
- Alerting tied to SLO burn rates and security events (e.g., injection spike, review-queue backlog, key-gen anomalies).
- Blue/green or canary deploys with automated rollback on SLO violation.

## CI/CD & Release Hygiene
- Mandatory checks: fmt/lint/typecheck/tests (Go, TS, Python) + security scans (gosec, npm audit, pip audit/ruff).
- Build reproducibility: pin toolchains (Go 1.23, TS 5.4.x, Python 3.11), lockfiles, SBOM generation.
- Artifacts: signed containers, provenance (SLSA-style), and checksum publishing for SDKs.
- Versioning: semantic releases with changelog; deprecate old API/SDK behaviors via feature flags.

## Deliverables
- Runbooks: incident response, key rotation, backup/restore, on-call dashboard links.
- Observability pack: Grafana/Datadog dashboards + alert policies.
- Security pack: threat model, policy test suite, audit tamper-evidence design.
- Release checklist: pre-flight tests, canary steps, rollback criteria, and post-release verification.
