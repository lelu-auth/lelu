#!/usr/bin/env node

// Lelu Policies CLI - with SQLite local storage support
import { readFileSync } from 'fs';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help') {
    showHelp();
    return;
  }

  try {
    const { LocalStorage } = await import('../dist/storage.js');
    const platformUrl = process.env.LELU_PLATFORM_URL;

    // Priority: 1. Platform URL, 2. Local SQLite
    if (platformUrl) {
      await executeOnPlatform(platformUrl, command, args);
    } else {
      await executeOnLocal(command, args);
    }
  } catch (err) {
    console.error('❌ Error:', err.message || err);
    process.exit(1);
  }
}

async function executeOnPlatform(platformUrl, command, args) {
  const { createClient } = await import('@lelu-auth/lelu');
  const apiKey = process.env.LELU_PLATFORM_API_KEY || 'platform-dev-key';
  const lelu = createClient({ baseUrl: platformUrl, apiKey });

  console.log(`🌐 Using platform: ${platformUrl}`);
  console.log('');

  switch (command) {
    case 'list':
      await listPoliciesPlatform(lelu);
      break;
    case 'get':
      await getPolicyPlatform(lelu, args[1]);
      break;
    case 'set':
      await setPolicyPlatform(lelu, args[1], args[2]);
      break;
    case 'delete':
      await deletePolicyPlatform(lelu, args[1]);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

async function executeOnLocal(command, args) {
  const { LocalStorage } = await import('../dist/storage.js');
  const storage = new LocalStorage();

  console.log(`📂 Using local storage: ${storage.getDbPath()}`);
  console.log('');

  switch (command) {
    case 'list':
      await listPoliciesLocal(storage);
      break;
    case 'get':
      await getPolicyLocal(storage, args[1]);
      break;
    case 'set':
      await setPolicyLocal(storage, args[1], args[2]);
      break;
    case 'delete':
      await deletePolicyLocal(storage, args[1]);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }

  storage.close();
}

// ─── Platform Operations ──────────────────────────────────────────────────────

async function listPoliciesPlatform(lelu) {
  const result = await lelu.listPolicies({});
  
  if (!result.policies.length) {
    console.log('📋 No policies found.');
    return;
  }

  console.log(`📜 Policies (${result.count} total):`);
  console.log('─'.repeat(80));
  
  for (const policy of result.policies) {
    console.log(`\n${policy.name} (v${policy.version})`);
    console.log(`  Created: ${new Date(policy.createdAt).toLocaleString()}`);
    console.log(`  Updated: ${new Date(policy.updatedAt).toLocaleString()}`);
    console.log(`  HMAC: ${policy.hmacSha256.substring(0, 16)}...`);
  }
}

async function getPolicyPlatform(lelu, name) {
  if (!name) {
    console.error('❌ Policy name required');
    console.log('Usage: lelu policies get <name>');
    process.exit(1);
  }

  const policy = await lelu.getPolicy({ name });
  
  console.log(`📜 Policy: ${policy.name} (v${policy.version})`);
  console.log('─'.repeat(80));
  console.log(policy.content);
}

async function setPolicyPlatform(lelu, name, filePath) {
  if (!name || !filePath) {
    console.error('❌ Policy name and file path required');
    console.log('Usage: lelu policies set <name> <file>');
    process.exit(1);
  }

  const content = readFileSync(filePath, 'utf-8');
  await lelu.upsertPolicy({ name, content });
  
  console.log(`✅ Policy '${name}' saved successfully`);
}

async function deletePolicyPlatform(lelu, name) {
  if (!name) {
    console.error('❌ Policy name required');
    console.log('Usage: lelu policies delete <name>');
    process.exit(1);
  }

  const result = await lelu.deletePolicy({ name });
  
  if (result.deleted) {
    console.log(`✅ Policy '${name}' deleted successfully`);
  } else {
    console.log(`⚠️  Policy '${name}' not found`);
  }
}

// ─── Local Operations ─────────────────────────────────────────────────────────

async function listPoliciesLocal(storage) {
  const policies = storage.listPolicies();
  
  if (!policies.length) {
    console.log('📋 No policies found in local storage.');
    console.log('');
    console.log('💡 Add a policy:');
    console.log('   lelu policies set my-policy policy.rego');
    return;
  }

  console.log(`📜 Policies (${policies.length} total):`);
  console.log('─'.repeat(80));
  
  for (const policy of policies) {
    console.log(`\n${policy.name} (v${policy.version})`);
    console.log(`  Created: ${new Date(policy.createdAt).toLocaleString()}`);
    console.log(`  Updated: ${new Date(policy.updatedAt).toLocaleString()}`);
    console.log(`  HMAC: ${policy.hmacSha256.substring(0, 16)}...`);
  }
}

async function getPolicyLocal(storage, name) {
  if (!name) {
    console.error('❌ Policy name required');
    console.log('Usage: lelu policies get <name>');
    process.exit(1);
  }

  const policy = storage.getPolicy(name);
  
  if (!policy) {
    console.error(`❌ Policy '${name}' not found`);
    process.exit(1);
  }

  console.log(`📜 Policy: ${policy.name} (v${policy.version})`);
  console.log('─'.repeat(80));
  console.log(policy.content);
}

async function setPolicyLocal(storage, name, filePath) {
  if (!name || !filePath) {
    console.error('❌ Policy name and file path required');
    console.log('Usage: lelu policies set <name> <file>');
    process.exit(1);
  }

  const content = readFileSync(filePath, 'utf-8');
  storage.upsertPolicy({ name, content });
  
  console.log(`✅ Policy '${name}' saved to local storage`);
}

async function deletePolicyLocal(storage, name) {
  if (!name) {
    console.error('❌ Policy name required');
    console.log('Usage: lelu policies delete <name>');
    process.exit(1);
  }

  const deleted = storage.deletePolicy(name);
  
  if (deleted) {
    console.log(`✅ Policy '${name}' deleted from local storage`);
  } else {
    console.log(`⚠️  Policy '${name}' not found`);
  }
}

function showHelp() {
  console.log('Lelu Policies CLI');
  console.log('');
  console.log('Usage:');
  console.log('  lelu policies list              List all policies');
  console.log('  lelu policies get <name>        Get policy content');
  console.log('  lelu policies set <name> <file> Create or update policy');
  console.log('  lelu policies delete <name>     Delete policy');
  console.log('');
  console.log('Storage:');
  console.log('  Default: Local SQLite (~/.lelu/lelu.db)');
  console.log('  Remote:  Set LELU_PLATFORM_URL environment variable');
  console.log('');
  console.log('Examples:');
  console.log('  lelu policies list');
  console.log('  lelu policies set auth-policy ./auth.rego');
  console.log('  LELU_PLATFORM_URL=https://lelu.example.com lelu policies list');
}

main();
