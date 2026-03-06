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

## License

MIT. See [LICENSE](LICENSE).
