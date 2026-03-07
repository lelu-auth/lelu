# Lelu Release Checklist

Use this checklist after creating release tags to verify npm, PyPI, Go module, and Vercel deployment.

## 1) Trigger Releases

- Main release tag (npm + PyPI workflows):

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

- Go SDK module tag (for `sdk/go` submodule path):

```bash
git tag sdk/go/vX.Y.Z
git push origin sdk/go/vX.Y.Z
```

## 2) GitHub Actions Verification

Open Actions:

- https://github.com/lelu-auth/lelu/actions

Check these workflows:

- `Release` (tag `vX.Y.Z`) for npm and PyPI
- `Release Please` (main branch auto release management)
- `Vercel Deploy` (PR preview / main production)

## 3) npm Verification

Package page:

- https://www.npmjs.com/package/lelu

Verify:

- Latest version matches tag/release version
- Install works:

```bash
npm view @lelu-auth/lelu version
npm i @lelu-auth/lelu@latest
```

## 4) PyPI Verification

Package page:

- https://pypi.org/project/lelu/

Verify:

- Latest version published
- Install works:

```bash
python -m pip install -U lelu
python -c "import lelu; print('ok')"
```

## 5) Go SDK Verification

Module path:

- `github.com/lelu-auth/lelu/sdk/go`

Verify:

```bash
go list -m -versions github.com/lelu-auth/lelu/sdk/go
go get github.com/lelu-auth/lelu/sdk/go@latest
```

Expected tag format for submodule release:

- `sdk/go/vX.Y.Z`

## 6) Vercel Verification

Vercel project dashboard:

- https://vercel.com/dashboard

Verify:

- PRs create Preview deployments
- Pushes to `main` create Production deployment
- Runtime env vars are present:
  - `NEXT_PUBLIC_ENGINE_URL`
  - `NEXT_PUBLIC_PLATFORM_URL`

Required GitHub Secrets for workflow:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## 7) Required Repository Secrets

Set in GitHub repo settings -> Secrets and variables -> Actions:

- `NPM_TOKEN`
- `PYPI_TOKEN`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## 8) Post-Release Smoke Tests

- `curl http://localhost:8083/healthz`
- Run one `POST /v1/agent/authorize` call
- Validate UI loads and trace pages open
- Validate SDK quick-start snippets install and execute
