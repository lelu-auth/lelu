# Complete Data Flow - API Keys, Redis, Audit Logs & Databases

This document shows the complete data flow through the Lelu system, from API key generation to audit log storage, including all interactions with Redis, SQLite, PostgreSQL, and S3.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Where is Redis Located?](#where-is-redis-located)
3. [Deployment Scenarios](#deployment-scenarios)
4. [Flow 1: API Key Generation & Storage](#flow-1-api-key-generation--storage)
5. [Flow 2: API Key Authentication](#flow-2-api-key-authentication)
6. [Flow 3: SDK Installation & Local Database Setup](#flow-3-sdk-installation--local-database-setup)
7. [Flow 4: Complete Request Lifecycle](#flow-4-complete-request-lifecycle)
8. [Flow 5: Audit Logging](#flow-5-audit-logging)
9. [Network Communication Details](#network-communication-details)
10. [Security Considerations](#security-considerations)
11. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         LELU SYSTEM ARCHITECTURE                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Client    │  │   Web UI    │  │   Engine    │  │  Platform   │   │
│  │   (SDK)     │  │  (Next.js)  │  │   (Go)      │  │   (Go)      │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
│         │                │                │                │           │
│         └────────────────┴────────────────┴────────────────┘           │
│                                  │                                      │
│                                  ▼                                      │
│         ┌────────────────────────────────────────────────┐             │
│         │           DATA STORAGE LAYER                   │             │
│         ├────────────────────────────────────────────────┤             │
│         │                                                │             │
│         │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │             │
│         │  │  Redis   │  │ SQLite/  │  │   AWS    │    │             │
│         │  │ (Cache)  │  │ Postgres │  │   S3     │    │             │
│         │  └──────────┘  └──────────┘  └──────────┘    │             │
│         │                                                │             │
│         │  • API Keys    • Audit Logs  • Archives       │             │
│         │  • Sessions    • Policies    • Compliance     │             │
│         │  • Rate Limits • Users       • Backups        │             │
│         └────────────────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Where is Redis Located?

### 🔴 CRITICAL: Redis is ALWAYS on the Server Side

**Redis is NEVER installed on the developer's local machine when using SDKs.**

```
┌─────────────────────────────────────────────────────────────────┐
│  REDIS LOCATION BY DEPLOYMENT TYPE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. SDK Users (Most Common)                                     │
│     ├─ Local Machine: NO Redis                                 │
│     ├─ Local Machine: Only SQLite (~/.lelu/cache.db)           │
│     └─ Server Side: Redis on Render.com (Hosted)               │
│                                                                  │
│  2. Full Stack Local Development                                │
│     ├─ Local Machine: Redis (localhost:6379)                   │
│     ├─ Local Machine: Engine + Platform + UI                   │
│     └─ Server Side: N/A (everything local)                     │
│                                                                  │
│  3. Hosted Production                                           │
│     ├─ Local Machine: NO Redis                                 │
│     ├─ Server Side: Redis on Render.com                        │
│     └─ Server Side: Engine + Platform + UI on Render.com       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Takeaways

✅ **SDK Users**: You NEVER need to install or configure Redis  
✅ **SDK Users**: Redis runs on the hosted server (Render.com)  
✅ **SDK Users**: You only have SQLite locally (~/.lelu/cache.db)  
✅ **Full Stack Developers**: Redis runs locally (localhost:6379)  
✅ **Hosted Production**: Redis runs on Render.com cloud  

---

## Deployment Scenarios

### Scenario 1: SDK User (Typical Developer)

**What You Install:**
```bash
# TypeScript
npm install @lelu/sdk

# Python
pip install auth-pe

# Go
go get github.com/lelu/sdk
```

**What Gets Created Locally:**
```
~/.lelu/
└── cache.db  (SQLite database)
```

**Where Redis Lives:**
```
🌐 Hosted on Render.com
URL: redis://red-xxx.oregon.render.com:6379
Access: Only accessible by hosted Engine
```

**Architecture Diagram:**
```
┌──────────────────────────────────────────────────────────────────┐
│  YOUR LOCAL MACHINE                                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Your Application Code                                 │     │
│  │  (TypeScript/Python/Go)                                │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       │                                          │
│                       │ import/require                           │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Lelu SDK                                              │     │
│  │  • @lelu/sdk (TypeScript)                             │     │
│  │  • auth-pe (Python)                                    │     │
│  │  • github.com/lelu/sdk (Go)                           │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       │                                          │
│                       │ Creates/Uses                             │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  ~/.lelu/cache.db (SQLite)                            │     │
│  │  • decisions_cache                                     │     │
│  │  • policies_cache                                      │     │
│  │  • audit_log_local                                     │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ❌ NO Redis Installation Required                              │
│  ❌ NO Engine Installation Required                             │
│  ❌ NO Platform Installation Required                           │
│                                                                   │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         │ HTTPS Request
                         │ Authorization: Bearer lelu_anon_xxx
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  RENDER.COM (HOSTED INFRASTRUCTURE)                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Lelu Engine (Go Server)                              │     │
│  │  URL: https://lelu-engine.onrender.com               │     │
│  │  Port: 443 (HTTPS)                                     │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       │                                          │
│                       │ Validates API Key                        │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  ✅ Redis Cloud (Managed by Render)                   │     │
│  │  URL: redis://red-xxx.oregon.render.com:6379         │     │
│  │                                                        │     │
│  │  Stores:                                               │     │
│  │  • API Keys (lelu:apikey:*)                           │     │
│  │  • Rate Limits (lelu:ip:gen:*)                        │     │
│  │  • Usage Stats (lelu:usage:*)                         │     │
│  │  • Session Data                                        │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  PostgreSQL (Managed by Render)                       │     │
│  │  URL: postgres://dpg-xxx.oregon.render.com/lelu      │     │
│  │                                                        │     │
│  │  Stores:                                               │     │
│  │  • Audit Events (audit_events table)                  │     │
│  │  • Policies (policies table)                          │     │
│  │  • Users (users table)                                 │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Summary for SDK Users:**
- ✅ Install SDK only (npm/pip/go get)
- ✅ SDK creates ~/.lelu/cache.db automatically
- ✅ SDK connects to hosted engine via HTTPS
- ✅ Redis is on Render.com (you never touch it)
- ✅ PostgreSQL is on Render.com (you never touch it)
- ❌ NO need to install Redis locally
- ❌ NO need to install Engine locally
- ❌ NO need to install Docker

---

### Scenario 2: Full Stack Local Development

**What You Install:**
```bash
# Install Redis locally
# Windows
choco install redis-64

# macOS
brew install redis

# Linux
sudo apt-get install redis-server

# Start Redis
redis-server

# Clone and run full stack
git clone https://github.com/lelu/prism
cd prism
docker-compose up  # OR manual setup
```

**What Gets Created Locally:**
```
localhost:6379        (Redis)
localhost:8083        (Engine)
localhost:3000        (Platform API)
localhost:3001        (Web UI)
./data/lelu.db        (SQLite for Platform)
```

**Where Redis Lives:**
```
💻 Local Machine
URL: localhost:6379
Access: Engine connects via localhost
```

**Architecture Diagram:**
```
┌──────────────────────────────────────────────────────────────────┐
│  YOUR LOCAL MACHINE (Full Stack Development)                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  ✅ Redis (localhost:6379)                            │     │
│  │  • API Keys                                            │     │
│  │  • Rate Limits                                         │     │
│  │  • Sessions                                            │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       │                                          │
│                       │ Connected by                             │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Lelu Engine (localhost:8083)                         │     │
│  │  • Authorization logic                                 │     │
│  │  • API key validation                                  │     │
│  │  • Policy evaluation                                   │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       │                                          │
│                       │ Connected by                             │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  SQLite (./data/lelu.db)                              │     │
│  │  • Audit logs                                          │     │
│  │  • Policies                                            │     │
│  │  • Users                                               │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Platform API (localhost:3000)                        │     │
│  │  • REST API endpoints                                  │     │
│  │  • Policy management                                   │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Web UI (localhost:3001)                              │     │
│  │  • Dashboard                                           │     │
│  │  • API key generation                                  │     │
│  │  • Policy editor                                       │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Summary for Full Stack Developers:**
- ✅ Install Redis locally (localhost:6379)
- ✅ Install Engine locally (localhost:8083)
- ✅ Install Platform locally (localhost:3000)
- ✅ Install Web UI locally (localhost:3001)
- ✅ All components communicate via localhost
- ✅ Use SQLite for Platform database
- ✅ Use Redis for API keys and caching

---

### Scenario 3: Hosted Production (Render.com)

**What You Deploy:**
```yaml
# render.yaml
services:
  - type: web
    name: lelu-engine
    env: go
    
  - type: web
    name: lelu-platform
    env: go
    
  - type: web
    name: lelu-ui
    env: node
    
  - type: redis
    name: lelu-redis
    
  - type: pserv
    name: lelu-postgres
```

**Where Redis Lives:**
```
🌐 Render.com Cloud
URL: redis://red-xxx.oregon.render.com:6379
Access: Only accessible by services in same Render account
```

**Architecture Diagram:**
```
┌──────────────────────────────────────────────────────────────────┐
│  RENDER.COM (PRODUCTION INFRASTRUCTURE)                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  ✅ Redis Cloud (Managed)                             │     │
│  │  URL: redis://red-xxx.oregon.render.com:6379         │     │
│  │  • High availability                                   │     │
│  │  • Automatic backups                                   │     │
│  │  • Monitoring included                                 │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       │                                          │
│                       │ Private network                          │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Lelu Engine (Web Service)                            │     │
│  │  URL: https://lelu-engine.onrender.com               │     │
│  │  • Auto-scaling                                        │     │
│  │  • Health checks                                       │     │
│  │  • SSL/TLS included                                    │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       │                                          │
│                       │ Private network                          │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  PostgreSQL (Managed)                                 │     │
│  │  URL: postgres://dpg-xxx.oregon.render.com/lelu      │     │
│  │  • Automatic backups                                   │     │
│  │  • Point-in-time recovery                              │     │
│  │  • Monitoring included                                 │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Platform API (Web Service)                           │     │
│  │  URL: https://lelu-platform.onrender.com             │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Web UI (Web Service)                                 │     │
│  │  URL: https://lelu.onrender.com                       │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Summary for Production Deployment:**
- ✅ Redis managed by Render.com
- ✅ PostgreSQL managed by Render.com
- ✅ All services auto-scale
- ✅ SSL/TLS certificates automatic
- ✅ Backups automatic
- ✅ Monitoring included
- ✅ Private network between services

---

## Comparison Table: Where is Each Component?

| Component | SDK User (Local) | Full Stack Dev (Local) | Hosted Production |
|-----------|------------------|------------------------|-------------------|
| **Your Application** | ✅ Local | ✅ Local | ✅ Local |
| **Lelu SDK** | ✅ Local | ✅ Local | ✅ Local |
| **SQLite Cache** | ✅ Local (~/.lelu/cache.db) | ❌ Not used | ❌ Not used |
| **Redis** | ❌ Hosted (Render.com) | ✅ Local (localhost:6379) | ✅ Hosted (Render.com) |
| **Engine** | ❌ Hosted (Render.com) | ✅ Local (localhost:8083) | ✅ Hosted (Render.com) |
| **Platform** | ❌ Hosted (Render.com) | ✅ Local (localhost:3000) | ✅ Hosted (Render.com) |
| **PostgreSQL** | ❌ Hosted (Render.com) | ✅ Local SQLite | ✅ Hosted (Render.com) |
| **Web UI** | ❌ Hosted (Render.com) | ✅ Local (localhost:3001) | ✅ Hosted (Render.com) |

---

## Flow 1: API Key Generation & Storage

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 1: User Requests API Key                                           │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ WEB UI: platform/ui/app/api/beta/generate/route.ts                      │
│ Location: Hosted on Render.com (https://lelu.onrender.com)             │
│                                                                          │
│  POST /api/beta/generate                                                │
│  ├─ Extract client IP from headers                                      │
│  ├─ Check rate limits (5/hour, 10/day per IP)                          │
│  ├─ Generate crypto-secure random key                                   │
│  └─ Store in Redis with metadata                                        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Rate Limit Check (Redis)                                        │
│ Redis Location: Render.com (redis://red-xxx.oregon.render.com:6379)    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ REDIS OPERATIONS (ON RENDER.COM)                                        │
│                                                                          │
│  Operation 1: Check Hourly Limit                                        │
│  ├─ GET lelu:ip:gen:hour:192.168.1.100:2026-03-30-14                   │
│  └─ Returns: "3" (current count)                                        │
│                                                                          │
│  Operation 2: Check Daily Limit                                         │
│  ├─ GET lelu:ip:gen:day:192.168.1.100:2026-03-30                       │
│  └─ Returns: "7" (current count)                                        │
│                                                                          │
│  Decision: 3 < 5 AND 7 < 10 → ALLOW                                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Generate API Key                                                │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ KEY GENERATION (Crypto-Secure)                                          │
│                                                                          │
│  // Generate 8-char short ID                                            │
│  const shortIDBytes = new Uint8Array(6);                                │
│  crypto.getRandomValues(shortIDBytes);                                  │
│  const shortID = Buffer.from(shortIDBytes)                              │
│                   .toString("base64url")                                │
│                   .substring(0, 8);                                     │
│  // Result: "abc12345"                                                  │
│                                                                          │
│  // Generate 32-char random part                                        │
│  const randomBytes = new Uint8Array(24);                                │
│  crypto.getRandomValues(randomBytes);                                   │
│  const randomPart = Buffer.from(randomBytes)                            │
│                      .toString("base64url")                             │
│                      .substring(0, 32);                                 │
│  // Result: "def456ghi789jkl012mno345pqr678"                           │
│                                                                          │
│  // Combine into final key                                              │
│  const apiKey = `lelu_anon_${shortID}_${randomPart}`;                  │
│  // Result: "lelu_anon_abc12345_def456ghi789jkl012mno345pqr678"        │
│                                                                          │
│  const tenantID = `anon_${shortID}`;                                    │
│  // Result: "anon_abc12345"                                             │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Store in Redis (ON RENDER.COM)                                  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ REDIS STORAGE (redis://red-xxx.oregon.render.com:6379)                  │
│                                                                          │
│  Operation: SET with Expiration                                         │
│  ├─ Key: lelu:apikey:lelu_anon_abc12345_def456ghi789jkl012mno345pqr678│
│  ├─ Value: {                                                            │
│  │    "tenant_id": "anon_abc12345",                                     │
│  │    "key_id": "abc12345",                                             │
│  │    "created_at": "2026-03-30T14:30:00Z",                            │
│  │    "revoked": false,                                                 │
│  │    "name": "Anonymous Beta Key",                                     │
│  │    "env": "anon",                                                    │
│  │    "created_ip": "192.168.1.100",                                    │
│  │    "is_anonymous": true                                              │
│  │  }                                                                   │
│  └─ TTL: 2592000 seconds (30 days)                                      │
│                                                                          │
│  Operation: Increment Rate Limit Counters                               │
│  ├─ INCR lelu:ip:gen:hour:192.168.1.100:2026-03-30-14                  │
│  │  └─ Returns: 4                                                       │
│  ├─ EXPIRE lelu:ip:gen:hour:192.168.1.100:2026-03-30-14 7200           │
│  ├─ INCR lelu:ip:gen:day:192.168.1.100:2026-03-30                      │
│  │  └─ Returns: 8                                                       │
│  └─ EXPIRE lelu:ip:gen:day:192.168.1.100:2026-03-30 172800             │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 5: Return to User                                                  │
│                                                                          │
│  Response: {                                                            │
│    "apiKey": "lelu_anon_abc12345_def456ghi789jkl012mno345pqr678",      │
│    "tenantId": "anon_abc12345",                                         │
│    "limits": {                                                          │
│      "dailyRequests": 500,                                              │
│      "minuteRequests": 10                                               │
│    },                                                                   │
│    "expiresIn": "30 days"                                               │
│  }                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```


## Flow 2: API Key Authentication

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Client Makes Request (From Your Local Machine)                  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ CLIENT APPLICATION (Your Local Machine)                                  │
│                                                                          │
│  HTTP Request:                                                          │
│  POST https://lelu-engine.onrender.com/v1/agent/authorize              │
│  Headers:                                                               │
│    Authorization: Bearer lelu_anon_abc12345_def456ghi789jkl012mno345pqr│
│    Content-Type: application/json                                       │
│  Body:                                                                  │
│    {                                                                    │
│      "tenant_id": "anon_abc12345",                                      │
│      "actor": "invoice_bot",                                            │
│      "action": "approve_refunds",                                       │
│      "resource": {"amount": "500"},                                     │
│      "confidence": 0.92                                                 │
│    }                                                                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ HTTPS over Internet
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Engine Receives Request (Render.com)                            │
│ Location: https://lelu-engine.onrender.com                             │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ ENGINE: engine/cmd/engine/main.go (Running on Render.com)               │
│                                                                          │
│  server := &http.Server{                                                │
│    Addr:    ":8083",                                                    │
│    Handler: authMiddleware.Middleware(mux),                             │
│  }                                                                      │
│                                                                          │
│  Request flows through middleware chain:                                │
│  1. Auth Middleware (validates API key)                                 │
│  2. Rate Limit Middleware                                               │
│  3. Handler (authorization logic)                                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Auth Middleware Validates Key                                   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ AUTH MIDDLEWARE: engine/internal/middleware/auth.go                     │
│                                                                          │
│  func (m *AuthMiddleware) Middleware(next http.Handler) {               │
│    // 1. Extract Authorization header                                   │
│    authHeader := r.Header.Get("Authorization")                          │
│    // "Bearer lelu_anon_abc12345_..."                                   │
│                                                                          │
│    // 2. Parse Bearer token                                             │
│    parts := strings.SplitN(authHeader, " ", 2)                          │
│    apiKey := parts[1]                                                   │
│    // "lelu_anon_abc12345_..."                                          │
│                                                                          │
│    // 3. Validate key format                                            │
│    if !apikeys.IsValidKeyFormat(apiKey) {                               │
│      return 401 Unauthorized                                            │
│    }                                                                    │
│                                                                          │
│    // 4. Get client IP                                                  │
│    clientIP := getClientIP(r)                                           │
│    // "192.168.1.100"                                                   │
│                                                                          │
│    // 5. For anonymous keys: bind to IP                                 │
│    if apikeys.IsAnonymousKey(apiKey) {                                  │
│      m.apiKeySvc.BindIPToKey(ctx, apiKey, clientIP)                     │
│    }                                                                    │
│                                                                          │
│    // 6. Validate key via Redis (ON RENDER.COM)                         │
│    tenantID, err := m.apiKeySvc.ValidateKey(ctx, apiKey)                │
│    if err != nil {                                                      │
│      return 401 Unauthorized                                            │
│    }                                                                    │
│                                                                          │
│    // 7. Inject context                                                 │
│    ctx = context.WithValue(ctx, ContextKeyTenantID, tenantID)           │
│    ctx = context.WithValue(ctx, ContextKeyAPIKey, apiKey)               │
│    ctx = context.WithValue(ctx, ContextKeyClientIP, clientIP)           │
│                                                                          │
│    // 8. Continue to handler                                            │
│    next.ServeHTTP(w, r.WithContext(ctx))                                │
│  }                                                                      │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Redis Validation (ON RENDER.COM)                                │
│ Redis Location: redis://red-xxx.oregon.render.com:6379                 │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ API KEY SERVICE: engine/internal/apikeys/apikeys.go                     │
│                                                                          │
│  func (s *Service) ValidateKey(ctx, apiKey) (tenantID, error) {         │
│    // Query Redis (ON RENDER.COM)                                       │
│    data, err := s.rdb.Get(ctx, "lelu:apikey:"+apiKey).Result()          │
│                                                                          │
│    // Parse JSON response                                               │
│    tenantID := extractJSONField(data, "tenant_id")                      │
│    revoked := extractJSONField(data, "revoked")                         │
│                                                                          │
│    // Check revoked status                                              │
│    if revoked == "true" {                                               │
│      return "", ErrKeyRevoked                                           │
│    }                                                                    │
│                                                                          │
│    return tenantID, nil                                                 │
│  }                                                                      │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
