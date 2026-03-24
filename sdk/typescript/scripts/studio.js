#!/usr/bin/env node

/**
 * Lelu Studio - Visual UI for managing policies and viewing audit logs
 * 
 * this launches a local web server with the Lelu UI
 * for interactively managing your authorization policies and viewing audit trails.
 */

const { spawn, spawnSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const path = require("node:path");
const http = require("node:http");

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  port: 3002,
  browser: process.env.BROWSER || null,
  noBrowser: false,
  docker: null, // auto-detect
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "-p" || arg === "--port") {
    options.port = parseInt(args[++i], 10);
  } else if (arg === "-b" || arg === "--browser") {
    options.browser = args[++i];
  } else if (arg === "--no-browser") {
    options.noBrowser = true;
  } else if (arg === "--docker") {
    options.docker = true;
  } else if (arg === "--no-docker") {
    options.docker = false;
  } else if (arg === "-h" || arg === "--help") {
    printHelp();
    process.exit(0);
  }
}

function printHelp() {
  console.log(`
Lelu Studio - Visual UI for Authorization Management

Usage:
  lelu studio [options]

Options:
  -p, --port <number>     Port number to start Studio on (default: 3002)
  -b, --browser <name>    Browser to open Studio in (chrome, firefox, safari)
  --no-browser            Don't automatically open browser
  --docker                Force Docker mode
  --no-docker             Force standalone mode (no Docker)
  -h, --help              Show this help

Environment Variables:
  LELU_PLATFORM_URL       Platform API URL (default: http://localhost:9091)
  LELU_PLATFORM_API_KEY   Platform API key (default: platform-dev-key)
  LELU_ENGINE_URL         Engine API URL (default: http://localhost:8083)
  BROWSER                 Browser to open (chrome, firefox, safari)

Examples:
  lelu studio                          # Start on default port 3002
  lelu studio -p 4000                  # Start on custom port
  lelu studio --no-browser             # Start without opening browser
  lelu studio -b firefox               # Open in Firefox
  BROWSER=chrome lelu studio           # Open in Chrome via env var

Docker Mode:
  If Docker is available, Lelu Studio will use docker-compose to start
  all services (UI, Platform API, Engine, Database). This provides the
  full experience with zero configuration.

Standalone Mode:
  If Docker is not available, Lelu Studio will run in CLI-only mode.
  You'll need to start the Platform API and Engine separately.
`);
}

function checkDocker() {
  try {
    const result = spawnSync("docker", ["--version"], { stdio: "pipe" });
    return result.status === 0;
  } catch {
    return false;
  }
}

function checkDockerCompose() {
  try {
    const result = spawnSync("docker-compose", ["--version"], { stdio: "pipe" });
    if (result.status === 0) return true;
    
    // Try docker compose (without hyphen)
    const result2 = spawnSync("docker", ["compose", "version"], { stdio: "pipe" });
    return result2.status === 0;
  } catch {
    return false;
  }
}

function findDockerCompose() {
  // Look for docker-compose.yml in current directory and parent directories
  let dir = process.cwd();
  const root = path.parse(dir).root;
  
  while (dir !== root) {
    const composePath = path.join(dir, "docker-compose.yml");
    if (existsSync(composePath)) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  
  return null;
}

function startWithDocker() {
  console.log("🐳 Docker detected - starting Lelu Studio with docker-compose...\n");
  
  const composeDir = findDockerCompose();
  if (!composeDir) {
    console.error("❌ docker-compose.yml not found in current directory or parent directories");
    console.error("   Please run this command from your Lelu project directory\n");
    process.exit(1);
  }
  
  console.log(`📁 Found docker-compose.yml in: ${composeDir}`);
  console.log("🚀 Starting services...\n");
  
  // Start docker-compose
  const composeCmd = checkDockerCompose() ? "docker-compose" : "docker";
  const composeArgs = composeCmd === "docker" ? ["compose", "up", "-d"] : ["up", "-d"];
  
  const result = spawnSync(composeCmd, composeArgs, {
    cwd: composeDir,
    stdio: "inherit",
  });
  
  if (result.status !== 0) {
    console.error("\n❌ Failed to start docker-compose");
    process.exit(1);
  }
  
  console.log("\n✅ Services started successfully!");
  console.log("\n📊 Service URLs:");
  console.log(`   UI:       http://localhost:${options.port}`);
  console.log(`   Platform: http://localhost:9091`);
  console.log(`   Engine:   http://localhost:8083`);
  
  // Wait for UI to be ready
  console.log("\n⏳ Waiting for UI to be ready...");
  waitForService(`http://localhost:${options.port}/healthz`, () => {
    console.log("✅ UI is ready!\n");
    
    if (!options.noBrowser) {
      openBrowser(`http://localhost:${options.port}`);
    } else {
      console.log(`🌐 Open http://localhost:${options.port} in your browser\n`);
    }
    
    console.log("💡 Tip: Press Ctrl+C to stop all services");
    console.log("    Or run: docker-compose down\n");
  });
}

function startStandalone() {
  console.log("📦 Starting Lelu Studio in standalone mode...\n");
  console.log("⚠️  Docker not detected - running in CLI-only mode");
  console.log("   You'll need to start Platform API and Engine separately\n");
  
  console.log("To start the full stack:");
  console.log("  1. Install Docker: https://docs.docker.com/get-docker/");
  console.log("  2. Run: lelu studio\n");
  
  console.log("Or start services manually:");
  console.log("  Platform API: cd platform && go run cmd/api/main.go");
  console.log("  Engine:       cd engine && go run cmd/engine/main.go");
  console.log("  UI:           cd platform/ui && npm run dev\n");
  
  console.log("📋 Available CLI commands:");
  console.log("  lelu audit-log    View audit events");
  console.log("  lelu policies     Manage policies");
  console.log("  lelu help         Show all commands\n");
}

function waitForService(url, callback, maxAttempts = 30) {
  let attempts = 0;
  
  const check = () => {
    attempts++;
    http.get(url, (res) => {
      if (res.statusCode === 200) {
        callback();
      } else if (attempts < maxAttempts) {
        setTimeout(check, 1000);
      } else {
        console.error(`\n❌ Service not ready after ${maxAttempts} seconds`);
        console.error(`   Check logs: docker-compose logs ui\n`);
        process.exit(1);
      }
    }).on("error", () => {
      if (attempts < maxAttempts) {
        setTimeout(check, 1000);
      } else {
        console.error(`\n❌ Service not ready after ${maxAttempts} seconds`);
        console.error(`   Check logs: docker-compose logs ui\n`);
        process.exit(1);
      }
    });
  };
  
  check();
}

function openBrowser(url) {
  const browser = options.browser || process.env.BROWSER;
  
  let command;
  let args = [url];
  
  if (browser) {
    // Use specified browser
    if (process.platform === "darwin") {
      command = "open";
      args = ["-a", browser, url];
    } else if (process.platform === "win32") {
      command = "start";
      args = [browser, url];
    } else {
      command = browser;
    }
  } else {
    // Use default browser
    if (process.platform === "darwin") {
      command = "open";
    } else if (process.platform === "win32") {
      command = "start";
      args = ["", url]; // Empty string for default browser
    } else {
      command = "xdg-open";
    }
  }
  
  try {
    spawn(command, args, {
      detached: true,
      stdio: "ignore",
    }).unref();
    
    console.log(`🌐 Opening ${url} in your browser...\n`);
  } catch (error) {
    console.log(`🌐 Please open ${url} in your browser\n`);
  }
}

function main() {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║                     Lelu Studio                           ║");
  console.log("║         Visual UI for Authorization Management           ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");
  
  // Auto-detect Docker if not specified
  if (options.docker === null) {
    options.docker = checkDocker() && checkDockerCompose();
  }
  
  if (options.docker) {
    startWithDocker();
  } else {
    startStandalone();
  }
}

main();
