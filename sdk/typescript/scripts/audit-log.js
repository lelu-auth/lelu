#!/usr/bin/env node

// Lelu Audit Log CLI
async function main() {
  try {
    // Dynamic import to handle ESM module
    const { createClient } = await import('@lelu-auth/lelu');
    
    const baseUrl = process.env.LELU_PLATFORM_URL || process.argv[2] || 'http://localhost:3001';
    const limit = parseInt(process.env.LELU_AUDIT_LIMIT || process.argv[3] || '20', 10);
    
    const lelu = createClient({ baseUrl });
    
    console.log(`Fetching audit log from ${baseUrl}...`);
    const result = await lelu.listAuditEvents({ limit });
    
    if (!result.events.length) {
      console.log('No audit events found.');
      return;
    }
    
    console.log(`\nAudit Log (${result.count} events, limit: ${limit})`);
    console.log('─'.repeat(80));
    
    for (const event of result.events) {
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
    
    if (result.nextCursor > 0) {
      console.log(`Use cursor ${result.nextCursor} to fetch more events.`);
    }
    
  } catch (err) {
    console.error('Error fetching audit log:', err.message || err);
    console.error('\nTroubleshooting:');
    console.error('- Ensure the Lelu platform service is running');
    console.error('- Check the platform URL (default: http://localhost:3001)');
    console.error('- Verify your network connection');
    process.exit(1);
  }
}

main();
