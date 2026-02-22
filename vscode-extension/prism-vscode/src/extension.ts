import * as vscode from "vscode";

type JsonRecord = Record<string, unknown>;

function getConfig() {
  const cfg = vscode.workspace.getConfiguration("prism");
  return {
    engineUrl: (cfg.get<string>("engineUrl") ?? "http://localhost:8082").replace(/\/$/, ""),
    platformUrl: (cfg.get<string>("platformUrl") ?? "http://localhost:9090").replace(/\/$/, ""),
    platformApiKey: cfg.get<string>("platformApiKey") ?? "platform-dev-key",
  };
}

async function requestJson(url: string, init?: RequestInit): Promise<JsonRecord> {
  const res = await fetch(url, init);
  const text = await res.text();

  let body: JsonRecord = {};
  if (text) {
    try {
      body = JSON.parse(text) as JsonRecord;
    } catch {
      body = { raw: text };
    }
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(body)}`);
  }

  return body;
}

function openJsonPreview(title: string, payload: unknown) {
  const doc = {
    language: "json",
    content: JSON.stringify(payload, null, 2),
  };

  vscode.workspace
    .openTextDocument(doc)
    .then((document) => vscode.window.showTextDocument(document, { preview: true }))
    .then(() => vscode.window.showInformationMessage(title));
}

async function runHealthCheck() {
  const cfg = getConfig();
  const target = await vscode.window.showQuickPick(
    [
      { label: "Engine", endpoint: `${cfg.engineUrl}/healthz` },
      { label: "Platform", endpoint: `${cfg.platformUrl}/healthz` },
    ],
    { placeHolder: "Select service to health check" }
  );

  if (!target) {
    return;
  }

  try {
    const data = await requestJson(target.endpoint);
    openJsonPreview(`Prism ${target.label} health check OK`, data);
  } catch (error) {
    vscode.window.showErrorMessage(`Prism ${target.label} health check failed: ${String(error)}`);
  }
}

async function runAuthorizeAgent() {
  const cfg = getConfig();

  const actor = await vscode.window.showInputBox({
    prompt: "Actor (agent id)",
    value: "invoice_bot",
    ignoreFocusOut: true,
  });
  if (!actor) {
    return;
  }

  const action = await vscode.window.showInputBox({
    prompt: "Action",
    value: "approve_refunds",
    ignoreFocusOut: true,
  });
  if (!action) {
    return;
  }

  const confidenceInput = await vscode.window.showInputBox({
    prompt: "Confidence score (0.0 - 1.0)",
    value: "0.92",
    ignoreFocusOut: true,
    validateInput: (value) => {
      const parsed = Number(value);
      if (Number.isNaN(parsed) || parsed < 0 || parsed > 1) {
        return "Enter a number between 0 and 1";
      }
      return undefined;
    },
  });
  if (!confidenceInput) {
    return;
  }

  const actingFor = await vscode.window.showInputBox({
    prompt: "Acting for (optional user id)",
    value: "user_123",
    ignoreFocusOut: true,
  });

  const resourceInput = await vscode.window.showInputBox({
    prompt: "Resource JSON (optional)",
    value: "{}",
    ignoreFocusOut: true,
    validateInput: (value) => {
      if (!value.trim()) {
        return undefined;
      }
      try {
        JSON.parse(value);
        return undefined;
      } catch {
        return "Enter valid JSON object";
      }
    },
  });

  const payload: JsonRecord = {
    actor,
    action,
    confidence: Number(confidenceInput),
  };

  if (actingFor && actingFor.trim()) {
    payload.acting_for = actingFor.trim();
  }

  if (resourceInput && resourceInput.trim()) {
    payload.resource = JSON.parse(resourceInput) as JsonRecord;
  }

  try {
    const data = await requestJson(`${cfg.engineUrl}/v1/agent/authorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    openJsonPreview("Prism authorize result", data);
  } catch (error) {
    vscode.window.showErrorMessage(`Prism authorize failed: ${String(error)}`);
  }
}

async function runGetTrace() {
  const cfg = getConfig();
  const traceId = await vscode.window.showInputBox({
    prompt: "Trace ID",
    placeHolder: "Paste trace id from authorize result",
    ignoreFocusOut: true,
  });

  if (!traceId) {
    return;
  }

  try {
    const data = await requestJson(`${cfg.platformUrl}/api/v1/audit/trace/${encodeURIComponent(traceId)}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.platformApiKey}`,
      },
    });
    openJsonPreview("Prism trace result", data);
  } catch (error) {
    vscode.window.showErrorMessage(`Prism trace lookup failed: ${String(error)}`);
  }
}

export function activate(context: vscode.ExtensionContext) {
  const health = vscode.commands.registerCommand("prism.healthCheck", runHealthCheck);
  const authorize = vscode.commands.registerCommand("prism.authorizeAgent", runAuthorizeAgent);
  const trace = vscode.commands.registerCommand("prism.getTrace", runGetTrace);

  context.subscriptions.push(health, authorize, trace);
}

export function deactivate() {
  return undefined;
}