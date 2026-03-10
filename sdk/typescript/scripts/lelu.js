#!/usr/bin/env node

/*
 * Lelu CLI
 *
 * Provides audit log viewing and other utilities for SDK users.
 */

const { spawnSync } = require("node:child_process");
const path = require("node:path");

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: false,
    ...options,
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} failed with code ${result.status}`);
  }
}

function showAuditLog() {
  const auditScript = path.join(__dirname, "audit-log.js");
  run("node", [auditScript]);
}

function printHelp() {
  console.log(`
Lelu CLI

Usage:
  lelu audit-log       View recent audit events from the platform
  lelu help            Show this help

Environment Variables:
  LELU_PLATFORM_URL   Platform API URL (default: http://localhost:3001)
  LELU_AUDIT_LIMIT    Number of events to fetch (default: 20)

Examples:
  lelu audit-log                                    # View recent audit events
  LELU_AUDIT_LIMIT=50 lelu audit-log               # View 50 recent events
  LELU_PLATFORM_URL=https://api.example.com lelu audit-log  # Use custom platform URL
`);
}

function main() {
  const command = process.argv[2] || "audit-log";

  if (command === "audit-log") {
    showAuditLog();
    return;
  }

  if (command === "help" || command === "-h" || command === "--help") {
    printHelp();
    return;
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

main();
