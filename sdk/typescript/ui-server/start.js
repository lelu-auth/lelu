#!/usr/bin/env node

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
