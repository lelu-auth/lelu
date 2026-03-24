#!/usr/bin/env node

/**
 * Build and bundle the Lelu UI for inclusion in the npm package
 * 
 * This script:
 * 1. Builds the Next.js UI in standalone mode
 * 2. Copies the standalone build to sdk/typescript/ui-server
 * 3. Makes it ready for bundling in the npm package
 */

const { execSync, spawn } = require('node:child_process');
const { existsSync, mkdirSync, cpSync, rmSync, writeFileSync } = require('node:fs');
const path = require('node:path');

const UI_DIR = path.join(__dirname, '../../../platform/ui');
const OUTPUT_DIR = path.join(__dirname, '../ui-server');

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║           Building Lelu UI for npm package               ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Step 1: Check if UI directory exists
if (!existsSync(UI_DIR)) {
  console.error('❌ UI directory not found:', UI_DIR);
  console.error('   Make sure you are running this from the sdk/typescript directory');
  process.exit(1);
}

console.log('📁 UI directory:', UI_DIR);
console.log('📦 Output directory:', OUTPUT_DIR, '\n');

// Step 2: Install UI dependencies if needed
console.log('📦 Checking UI dependencies...');
const nodeModulesPath = path.join(UI_DIR, 'node_modules');
if (!existsSync(nodeModulesPath)) {
  console.log('📥 Installing UI dependencies...');
  try {
    execSync('npm install', { cwd: UI_DIR, stdio: 'inherit' });
    console.log('✅ Dependencies installed\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed\n');
}

// Step 3: Build Next.js in standalone mode
console.log('🔨 Building Next.js UI...');
try {
  execSync('npm run build', { cwd: UI_DIR, stdio: 'inherit' });
  console.log('✅ UI built successfully\n');
} catch (error) {
  console.error('❌ Failed to build UI');
  process.exit(1);
}

// Step 4: Clean output directory
console.log('🧹 Cleaning output directory...');
if (existsSync(OUTPUT_DIR)) {
  rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
mkdirSync(OUTPUT_DIR, { recursive: true });
console.log('✅ Output directory ready\n');

// Step 5: Copy standalone build
console.log('📋 Copying standalone build...');
const standalonePath = path.join(UI_DIR, '.next/standalone');
const staticPath = path.join(UI_DIR, '.next/static');
const publicPath = path.join(UI_DIR, 'public');

if (!existsSync(standalonePath)) {
  console.error('❌ Standalone build not found');
  console.error('   Make sure next.config.mjs has output: "standalone"');
  process.exit(1);
}

try {
  // Copy standalone server
  cpSync(standalonePath, OUTPUT_DIR, { recursive: true });
  
  // Copy static files
  const outputStaticPath = path.join(OUTPUT_DIR, 'platform/ui/.next/static');
  mkdirSync(path.dirname(outputStaticPath), { recursive: true });
  cpSync(staticPath, outputStaticPath, { recursive: true });
  
  // Copy public files
  const outputPublicPath = path.join(OUTPUT_DIR, 'platform/ui/public');
  if (existsSync(publicPath)) {
    cpSync(publicPath, outputPublicPath, { recursive: true });
  }
  
  console.log('✅ Files copied successfully\n');
} catch (error) {
  console.error('❌ Failed to copy files:', error.message);
  process.exit(1);
}

// Step 6: Create startup script
console.log('📝 Creating startup script...');
const startupScript = `#!/usr/bin/env node

/**
 * Lelu UI Server
 * Serves the bundled Next.js UI
 */

const path = require('path');

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '3002';
process.env.HOSTNAME = process.env.HOSTNAME || 'localhost';

// Start the Next.js server
const serverPath = path.join(__dirname, 'platform/ui/server.js');
require(serverPath);
`;

writeFileSync(path.join(OUTPUT_DIR, 'start.js'), startupScript, 'utf8');
console.log('✅ Startup script created\n');

// Step 7: Create README
const readme = `# Lelu UI Server

This directory contains the bundled Next.js UI for Lelu Studio.

## Usage

\`\`\`bash
node start.js
\`\`\`

## Environment Variables

- \`PORT\` - Port to run the server on (default: 3002)
- \`PLATFORM_URL\` - Platform API URL (default: http://localhost:9091)
- \`PLATFORM_API_KEY\` - Platform API key (default: platform-dev-key)
- \`LELU_ENGINE_URL\` - Engine API URL (default: http://localhost:8083)

## Note

This is a standalone Next.js build bundled with the @lelu-auth/lelu npm package.
It allows \`lelu studio\` to work without requiring Docker or external dependencies.
`;

writeFileSync(path.join(OUTPUT_DIR, 'README.md'), readme, 'utf8');

// Step 8: Calculate size
console.log('📊 Build statistics:');
try {
  const { execSync } = require('child_process');
  const size = execSync(`du -sh "${OUTPUT_DIR}"`, { encoding: 'utf8' }).trim();
  console.log(`   Size: ${size.split('\t')[0]}`);
} catch {
  console.log('   Size: (unable to calculate)');
}

console.log('\n✅ UI build complete!');
console.log(`📦 Bundled UI ready at: ${OUTPUT_DIR}`);
console.log('\n💡 The UI will be included in the npm package and can be started with:');
console.log('   npx lelu studio\n');
