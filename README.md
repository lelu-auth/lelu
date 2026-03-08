# Lelu

## About the Project

Lelu is a framework-agnostic authorization engine for AI agents. It combines policy evaluation, confidence-aware controls, runtime risk checks, and human-review workflows in one system.

It is designed so teams can ship agent features faster without weakening security.

Out of the box, Lelu provides:

- Confidence-aware authorization
- Prompt-injection prefiltering
- Human-in-the-loop review queue
- Runtime risk evaluation
- Short-lived (JIT) scoped tokens
- Audit trail and incident hooks

## Why Lelu

Authorization for AI agents is still a half-solved problem. Most tools handle static rules but do not account for model uncertainty, dynamic risk, and operational safety in one flow.

Lelu solves this by making decisions through a layered pipeline:

- Injection check
- Confidence resolution and gate
- Policy evaluation (YAML or Rego)
- Risk evaluation
- Most-restrictive final decision merge

This helps teams avoid over-permissive agent behavior while keeping developer workflow simple.

## Quick Start

```bash
docker compose up -d --build
curl http://localhost:8083/healthz
```

## Contribution

Lelu is free and open source under the MIT License.

You can support the project by:

- Contributing code
- Suggesting features
- Reporting bugs and issues
- Improving documentation and examples

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Security

If you discover a security issue, please report it privately to:

`abenezergetachew0923@gmail.com`

Reports will be reviewed promptly and handled responsibly.

## CI/CD

This repository includes automated release workflows:

- npm publish: `sdk/typescript` -> `@lelu-auth/lelu`
- PyPI publish: `sdk/python` -> `lelu-agent-auth-sdk`
- Go SDK release validation: `sdk/go` (versioned via git tags)
- Vercel deployment: `platform/ui` (Preview on PR, Production on `main`) using a Dockerized Node 20 runner
- Release Please: multi-package release PRs from `main`

Release tags:

- Main release tag format: `vX.Y.Z`
- The `Release` workflow derives npm/PyPI SDK versions from the tag value automatically.

Required GitHub Secrets:

- `NPM_TOKEN`
- `PYPI_API_TOKEN` (preferred) or `PYPI_TOKEN`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `RELEASE_PLEASE_TOKEN` (PAT with `contents: write` and `pull_requests: write`)

## License

MIT. See [LICENSE](LICENSE).
