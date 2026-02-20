# Contributing to Prism (Auth Permission Engine)

First off, thank you for considering contributing to Prism! It's people like you that make Prism such a great tool for securing the Agentic Web.

## 🚀 Getting Started

Prism is built with a Go-based evaluation engine, a Next.js platform UI, and SDKs for Python and TypeScript.

### Prerequisites

- [Go](https://golang.org/doc/install) 1.21+
- [Node.js](https://nodejs.org/en/download/) 18+
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Python](https://www.python.org/downloads/) 3.9+ (for Python SDK)

### Local Development Environment

The easiest way to get started is using Docker Compose, which spins up the Engine, Platform UI, and Redis.

```bash
# Build the binaries and Docker images
make build

# Start the local environment
docker-compose up -d
```

The services will be available at:
- **Engine API:** `http://localhost:8080`
- **Platform UI:** `http://localhost:3000`

## 🧩 How to Contribute

We welcome contributions of all kinds! Here are some areas where we'd love your help:

### 1. SDK Integrations (High Priority)
We want Prism to work seamlessly with every major AI agent framework. If you use a framework that isn't supported yet, consider building an integration!

**Python SDK (`sdk/python/auth_pe/`)**
- Subclass the `AgentMiddleware` base class to intercept tool calls and extract confidence scores.
- **Help Wanted:** LlamaIndex, CrewAI, Semantic Kernel, AutoGen.

**TypeScript SDK (`sdk/typescript/src/`)**
- **Help Wanted:** Vercel AI SDK, LangChain.js (expand existing), Model Context Protocol (MCP).

### 2. Custom Rego Evaluators (Plugins)
Prism's Go engine supports loading custom Rego policies from a directory. You can write custom Rego modules to extend the evaluation logic without modifying the core engine.
- Drop your `.rego` files into a directory and set `REGO_POLICY_PATH=/path/to/dir`.
- We'd love to see community-contributed Rego templates for common compliance standards (SOC2, HIPAA, GDPR).

### 3. Core Engine Improvements
The core engine is written in Go (`engine/`).
- **Human-in-the-Loop (HITL):** Help us build out the Redis-backed review queue for actions that require human approval.
- **Performance:** Optimize the in-memory evaluation latency.

## 🛠️ Submitting a Pull Request

1. **Fork** the repository and create your branch from `main`.
2. **Write tests** for your new feature or bug fix.
3. **Run tests** locally to ensure everything passes.
4. **Update documentation** if you are adding a new feature or integration.
5. **Submit a PR** with a clear description of the problem and your solution.

## 🏷️ Good First Issues

If you're new to the project, look for issues tagged with `good first issue` or `help wanted` on our GitHub issue tracker. These are specifically scoped to be approachable for new contributors.

## 💬 Community

Join our Discord server (link coming soon) to discuss ideas, ask questions, and collaborate with other contributors!
