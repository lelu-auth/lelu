# Prism VS Code Extension

VS Code commands for Prism Engine + Platform:

- `Prism: Health Check`
- `Prism: Authorize Agent Action`
- `Prism: Get Trace By ID`

## 1) Prerequisites

- Prism stack running with Docker:

```bash
docker compose up -d --build
```

- Endpoints:
  - Engine: `http://localhost:8082`
  - Platform: `http://localhost:9090`

## 2) Local extension test (Extension Host)

```bash
cd vscode-extension/prism-vscode
npm install
npm run compile
```

Then in VS Code:

1. Open this folder: `vscode-extension/prism-vscode`
2. Press `F5`
3. In the Extension Development Host, open Command Palette and run:
   - `Prism: Health Check`
   - `Prism: Authorize Agent Action`
   - `Prism: Get Trace By ID`

## 3) Extension settings

In VS Code settings, configure:

- `prism.engineUrl` (default: `http://localhost:8082`)
- `prism.platformUrl` (default: `http://localhost:9090`)
- `prism.platformApiKey` (default: `platform-dev-key`)

You can set them in `.vscode/settings.json`:

```json
{
  "prism.engineUrl": "http://localhost:8082",
  "prism.platformUrl": "http://localhost:9090",
  "prism.platformApiKey": "platform-dev-key"
}
```

## 4) Package and install (.vsix)

```bash
cd vscode-extension/prism-vscode
npm install
npm run compile
npm run package
```

Install the generated `.vsix` file:

```bash
code --install-extension prism-vscode-0.1.0.vsix
```

## 5) Publish to Marketplace

1. Create Azure DevOps publisher + Personal Access Token.
2. Login once:

```bash
npx vsce login prism
```

3. Publish:

```bash
npm run publish
```

## 6) Test Prism SDK installs

### Python (`pip`)

```bash
cd sdk/python
python -m pip install -U build
python -m build
python -m pip install dist/*.whl
python -c "import auth_pe; print('ok')"
```

### TypeScript (`npm`)

```bash
cd sdk/typescript
npm install
npm run build
npm pack
```

In a separate test app:

```bash
npm install /path/to/prism-0.1.0.tgz
```