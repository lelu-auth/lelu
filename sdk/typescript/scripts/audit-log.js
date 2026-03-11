#!/usr/bin/env node

// Lelu Audit Log CLI - with SQLite local storage support
async function main() {
  try {
    const { LocalStorage } = await import('../dist/storage.js');
    
    const platformUrl = process.env.LELU_PLATFORM_URL;
    const limit = parseInt(process.env.LELU_AUDIT_LIMIT || process.argv[2] || '20', 10);
    
    // Priority: 1. Platform URL, 2. Local SQLite
    if (platformUrl) {
      await fetchFromPlatform(platformUrl, limit);
    } else {
      await fetchFromLocal(limit);
    }
    
  } catch (err) {
    console.error('❌ Error fetching audit log:', err.message || err);
    process.exit(1);
  }
}

async function fetchFromPlatform(platformUrl, limit) {
  const { createClient } = await import('@lelu-auth/lelu');
  const apiKey = process.env.LELU_PLATFORM_API_KEY || 'platform-dev-key';
  
  console.log(`Fetching audit log from ${platformUrl}...`);
  
  // Check if service is reachable
  try {
    const healthResponse = await fetch(`${platformUrl}/healthz`, { 
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    if (!healthResponse.ok) {
      throw new Error('Service not healthy');
    }
  } catch (healthError) {
    console.log('❌ Lelu platform service is not reachable');
    console.log('');
    console.log('💡 Falling back to local SQLite storage...');
    console.log('   Set LELU_PLATFORM_URL to use remote platform');
    console.log('');
    await fetchFromLocal(limit);
    return;
  }
  
  const lelu = createClient({ baseUrl: platformUrl, apiKey });
  const result = await lelu.listAuditEvents({ limit });
  
  displayAuditEvents(result.events, result.count, limit, result.nextCursor, 'platform');
}

async function fetchFromLocal(limit) {
  const { LocalStorage } = await import('../dist/storage.js');
  const storage = new LocalStorage();
  
  console.log(`📂 Using local storage: ${storage.getDbPath()}`);
  console.log('');
  
  const result = storage.listAuditEvents({ limit });
  
  if (!result.events.length) {
    console.log('📋 No audit events found in local storage.');
    console.log('');
    console.log('This could mean:');
    console.log('- No authorization requests have been logged yet');
    console.log('- Audit events are stored in a remote platform');
    console.log('');
    console.log('💡 To use remote platform:');
    console.log('   LELU_PLATFORM_URL=https://your-platform.com lelu audit-log');
    storage.close();
    return;
  }
  
  displayAuditEvents(result.events, result.count, limit, result.nextCursor, 'local');
  storage.close();
}

function displayAuditEvents(events, count, limit, nextCursor, source) {
  console.log(`\n📊 Audit Log (${count} events, limit: ${limit}) [${source}]`);
  console.log('─'.repeat(80));
  
  for (const event of events) {
    const timestamp = new Date(event.timestamp).toLocaleString();
    const confidence = event.confidenceScore ? ` (confidence: ${event.confidenceScore.toFixed(2)})` : '';
    const resource = event.resource ? ` on ${JSON.stringify(event.resource)}` : '';
    
    console.log(`[${timestamp}] ${event.actor} → ${event.action}${resource}`);
    console.log(`  Decision: ${event.decision}${confidence}`);
    if (event.reason) {
      console.log(`  Reason: ${event.reason}`);
    }
    if (event.downgradedScope) {
      console.log(`  Downgraded scope: ${event.downgradedScope}`);
    }
    console.log(`  Trace ID: ${event.traceId}`);
    console.log('');
  }
  
  if (nextCursor > 0) {
    console.log(`📄 Use cursor ${nextCursor} to fetch more events.`);
  }
}

main();
