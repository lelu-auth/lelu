# Changelog

## [0.3.6](https://github.com/lelu-auth/lelu/compare/python-sdk-v0.3.5...python-sdk-v0.3.6) (2026-03-30)


### Features

* Add anonymous rate limiting, dashboard, and API key management ([b8f24ad](https://github.com/lelu-auth/lelu/commit/b8f24ad55b5f72b3daee88bb18341635036b7fc3))
* Add built-in CLI audit-log command to all SDKs ([0943686](https://github.com/lelu-auth/lelu/commit/094368663337c0f6844b8b159aabfe53ebe79ccf))
* Add comprehensive CLI functionality to all SDKs ([61f292b](https://github.com/lelu-auth/lelu/commit/61f292bd35eb806d3812bb8e593ddebb3dac8db4))
* add extensibility for OSS contributors and YC alignment ([daa7177](https://github.com/lelu-auth/lelu/commit/daa7177fe67a26ff26e0c16e0981af14a84c407e))
* Add SQLite local storage for all SDKs ([e38a67a](https://github.com/lelu-auth/lelu/commit/e38a67afd4e32c8b3b2966e378e918773f404ee3))
* Complete Phase 2 Behavioral Analytics SDK Updates ([0692d0d](https://github.com/lelu-auth/lelu/commit/0692d0dd221fc29c23abdb25f71019e8676f86aa))
* implement Phase 1 Enhanced Observability & Telemetry for AI Agents ([c3a80f7](https://github.com/lelu-auth/lelu/commit/c3a80f707052e1958021a89333fc54f416bb079a))
* implement Phase 3 Real-time Intelligence for AI agent observability ([903dc2c](https://github.com/lelu-auth/lelu/commit/903dc2ce525d6d8cb8ce1663486e68585c3f1030))
* Phase 1 — Go engine, Docker, CI/CD, TS + Python SDKs ([575a5d7](https://github.com/lelu-auth/lelu/commit/575a5d799a712b7dda8f5d2f42a5ec1c4e11489f))
* Phase 2 — Confidence Layer (queue, SecureTool, LangGraph, S3 sink) ([bb271e4](https://github.com/lelu-auth/lelu/commit/bb271e40ab3fc59dab18d5f4f755dc1045c5d8a0))
* Phase 3 — Cloud Platform, Trace Explorer UI, React hook, FastAPI/Express middleware ([b3ea833](https://github.com/lelu-auth/lelu/commit/b3ea83306d2744f7fdeed00d70d7c75966ff6160))
* Phase 4 scaffold — Helm chart, Rego compatibility, AutoGPT plugin, OIDC SSO, OSS release workflow ([14a9ebd](https://github.com/lelu-auth/lelu/commit/14a9ebd277f439c954b37de5d4cc6cec8c017c9e))
* release Python SDK v0.3.6 with hosted engine integration ([d3400a4](https://github.com/lelu-auth/lelu/commit/d3400a46f54982ce46197c60782413e1044a220a))
* release TypeScript SDK v0.2.7 with hosted engine integration ([2c84a4b](https://github.com/lelu-auth/lelu/commit/2c84a4b16ebbdc4c0f7f03ee50cd438ca1a1fd4d))
* rename to prizm-engine and overhaul UI landing page ([2b1c0ad](https://github.com/lelu-auth/lelu/commit/2b1c0ad6ed65c1c9be979c2122c297ba8d3db6b2))


### Bug Fixes

* add missing sdk/python/README.md required by hatchling ([46d8fc6](https://github.com/lelu-auth/lelu/commit/46d8fc6296b341283923d0e7e2e7bebe05a0f435))
* Add type annotations to LocalStorage context manager methods ([1111a6a](https://github.com/lelu-auth/lelu/commit/1111a6a83b050b575eb765c78bcd360b9ec599c6))
* add type cast for Depends return in fastapi.py ([4065325](https://github.com/lelu-auth/lelu/commit/40653254b199894adea41c12792eed0a3986f5d7))
* Improve error handling in Python SDK CLI ([05e32a7](https://github.com/lelu-auth/lelu/commit/05e32a7702167d27a11db4e2b62750f2cc0162ac))
* invalid f-string conversion chain in AuthEngineError.__repr__ ([12ec3ec](https://github.com/lelu-auth/lelu/commit/12ec3ec584e6fb94d38b77086804d8bb241eabb9))
* resolve final mypy errors in Python SDK observability ([0f7667a](https://github.com/lelu-auth/lelu/commit/0f7667a04ec35cb4e09d96e7ce3e648b3a32de38))
* resolve mypy redefinition errors in Python SDK observability ([e958131](https://github.com/lelu-auth/lelu/commit/e958131074a13007c43273ea12e5b1a5090bf3a6))
* resolve mypy type checking errors in Python SDK observability ([c54a5c3](https://github.com/lelu-auth/lelu/commit/c54a5c36f80c4ddf96a3cce253760c2db39a4a65))
* resolve mypy type errors in Python SDK ([4f853fa](https://github.com/lelu-auth/lelu/commit/4f853fadae9efb03f0383a8037f671cf0a024e6c))
* Resolve mypy type errors in Python SDK Phase 2 methods ([910655e](https://github.com/lelu-auth/lelu/commit/910655e4614ebdde4641e63886f87d57175512b1))


### Documentation

* Add Docker deployment documentation and update SDK packages ([15d4d15](https://github.com/lelu-auth/lelu/commit/15d4d15db185b2c4a1a97eb5ea6f330a1f40343c))
* add Docker Hub engine usage across READMEs ([f96f7dc](https://github.com/lelu-auth/lelu/commit/f96f7dc93139e720ad00fbbc2d18889eb0cd7473))
* migrate repository references to lelu-auth ([8b30620](https://github.com/lelu-auth/lelu/commit/8b30620c40828d30a613436530ddcf5db790f6b9))


### Miscellaneous

* **branding:** finalize Prism naming across repo ([d33b53c](https://github.com/lelu-auth/lelu/commit/d33b53ca1a5f2d9da5d82b3113f4e927f3168d1f))
* bump Python SDK to v0.2.0 for PyPI publication ([ce4a35b](https://github.com/lelu-auth/lelu/commit/ce4a35b52f85ddabab595a9a5db8ecf2cbb07726))
* bump version to 0.0.5 and add author information ([0ffd3d8](https://github.com/lelu-auth/lelu/commit/0ffd3d8aaa22bb4fa035f760aa9fb52a2a333f8c))
* release main ([f1dfe74](https://github.com/lelu-auth/lelu/commit/f1dfe74e67498f3e1a05d8a56cfc02cc55c073db))
* release main ([9fb4e99](https://github.com/lelu-auth/lelu/commit/9fb4e992820e42a821988f2c7735d339cadfde48))
* rename Python package to prism-engine ([1974a0f](https://github.com/lelu-auth/lelu/commit/1974a0f59d4c796de4fed6a115cfff85d7802568))
* **sdk:** rename npm package references to prism ([5313e3c](https://github.com/lelu-auth/lelu/commit/5313e3c6bca43713848b1ac455f1da16fc19491a))
* Update SDK exports and engine dependencies ([9a03031](https://github.com/lelu-auth/lelu/commit/9a030315168a6d74fa4c1a0496cf45990987462a))

## [0.1.1](https://github.com/lelu-auth/lelu/compare/python-sdk-v0.1.0...python-sdk-v0.1.1) (2026-03-08)


### Features

* add extensibility for OSS contributors and YC alignment ([daa7177](https://github.com/lelu-auth/lelu/commit/daa7177fe67a26ff26e0c16e0981af14a84c407e))
* Phase 1 — Go engine, Docker, CI/CD, TS + Python SDKs ([575a5d7](https://github.com/lelu-auth/lelu/commit/575a5d799a712b7dda8f5d2f42a5ec1c4e11489f))
* Phase 2 — Confidence Layer (queue, SecureTool, LangGraph, S3 sink) ([bb271e4](https://github.com/lelu-auth/lelu/commit/bb271e40ab3fc59dab18d5f4f755dc1045c5d8a0))
* Phase 3 — Cloud Platform, Trace Explorer UI, React hook, FastAPI/Express middleware ([b3ea833](https://github.com/lelu-auth/lelu/commit/b3ea83306d2744f7fdeed00d70d7c75966ff6160))
* Phase 4 scaffold — Helm chart, Rego compatibility, AutoGPT plugin, OIDC SSO, OSS release workflow ([14a9ebd](https://github.com/lelu-auth/lelu/commit/14a9ebd277f439c954b37de5d4cc6cec8c017c9e))
* rename to prizm-engine and overhaul UI landing page ([2b1c0ad](https://github.com/lelu-auth/lelu/commit/2b1c0ad6ed65c1c9be979c2122c297ba8d3db6b2))


### Bug Fixes

* add missing sdk/python/README.md required by hatchling ([46d8fc6](https://github.com/lelu-auth/lelu/commit/46d8fc6296b341283923d0e7e2e7bebe05a0f435))
* add type cast for Depends return in fastapi.py ([4065325](https://github.com/lelu-auth/lelu/commit/40653254b199894adea41c12792eed0a3986f5d7))
* invalid f-string conversion chain in AuthEngineError.__repr__ ([12ec3ec](https://github.com/lelu-auth/lelu/commit/12ec3ec584e6fb94d38b77086804d8bb241eabb9))
* resolve mypy type errors in Python SDK ([4f853fa](https://github.com/lelu-auth/lelu/commit/4f853fadae9efb03f0383a8037f671cf0a024e6c))


### Documentation

* migrate repository references to lelu-auth ([8b30620](https://github.com/lelu-auth/lelu/commit/8b30620c40828d30a613436530ddcf5db790f6b9))


### Miscellaneous

* **branding:** finalize Prism naming across repo ([d33b53c](https://github.com/lelu-auth/lelu/commit/d33b53ca1a5f2d9da5d82b3113f4e927f3168d1f))
* rename Python package to prism-engine ([1974a0f](https://github.com/lelu-auth/lelu/commit/1974a0f59d4c796de4fed6a115cfff85d7802568))
* **sdk:** rename npm package references to prism ([5313e3c](https://github.com/lelu-auth/lelu/commit/5313e3c6bca43713848b1ac455f1da16fc19491a))
