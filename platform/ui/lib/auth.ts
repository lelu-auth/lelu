import { createClient, RedisClientType } from "redis";
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  lastSeenAt: string;
}

export const SESSION_COOKIE = "lelu_session";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days
const RATE_LIMIT_WINDOW = 60; // 1 minute
const RATE_LIMIT_MAX = 10; // max attempts per window per IP

// ── Redis connection ──────────────────────────────────────────────────────────
// Using a module-level singleton that properly handles reconnects.
// In serverless (Vercel/Edge), each cold start gets a fresh module so this
// always starts from null — that's fine.

let _redis: RedisClientType | null = null;

async function getRedis(): Promise<RedisClientType> {
  if (_redis?.isReady) return _redis;

  // Disconnect any stale client before creating a new one
  if (_redis) {
    try { await _redis.disconnect(); } catch { /* ignore */ }
    _redis = null;
  }

  const url = process.env.REDIS_URL
    ?? process.env.REDIS_ADDR
    ?? "redis://localhost:6379";

  if (!process.env.REDIS_URL && !process.env.REDIS_ADDR) {
    console.warn("[auth] REDIS_URL is not set — falling back to localhost:6379. Set REDIS_URL in your Vercel environment variables.");
  }

  const client = createClient({
    url: url.startsWith("redis") ? url : `redis://${url}`,
    socket: {
      connectTimeout: 2000,
      reconnectStrategy: false, // don't auto-reconnect in serverless — next request creates a fresh client
    },
  }) as RedisClientType;

  client.on("error", (err) => {
    console.error("[auth] Redis error:", err.message);
  });

  client.on("end", () => {
    if (_redis === client) _redis = null;
  });

  await client.connect();
  _redis = client;
  return _redis;
}

// ── Password hashing ─────────────────────────────────────────────────────────

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const derived = scryptSync(password, salt, 64);
    return timingSafeEqual(derived, Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

// ── Rate limiting (sliding window via Redis sorted set) ───────────────────────

export async function checkRateLimit(key: string): Promise<{ ok: boolean; remaining: number }> {
  try {
    const redis = await getRedis();
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW * 1000;
    const redisKey = `ratelimit:${key}`;

    // Remove expired entries, count current, add new entry atomically
    await redis.zRemRangeByScore(redisKey, 0, windowStart);
    const count = await redis.zCard(redisKey);

    if (count >= RATE_LIMIT_MAX) {
      return { ok: false, remaining: 0 };
    }

    await redis.zAdd(redisKey, { score: now, value: `${now}-${randomBytes(4).toString("hex")}` });
    await redis.expire(redisKey, RATE_LIMIT_WINDOW);

    return { ok: true, remaining: RATE_LIMIT_MAX - count - 1 };
  } catch {
    // If Redis is down, fail open (don't block the user)
    return { ok: true, remaining: RATE_LIMIT_MAX };
  }
}

// ── User management ───────────────────────────────────────────────────────────

export async function createUser(name: string, email: string, password: string): Promise<User> {
  const redis = await getRedis();
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await redis.get(`user:email:${normalizedEmail}`);
  if (existing) throw new Error("EMAIL_TAKEN");

  const user: User = {
    id: randomBytes(16).toString("hex"),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  // Write both lookup keys atomically
  const multi = redis.multi();
  multi.set(`user:email:${user.email}`, JSON.stringify(user));
  multi.set(`user:id:${user.id}`, JSON.stringify(user));
  await multi.exec();

  return user;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const redis = await getRedis();
  const raw = await redis.get(`user:email:${email.toLowerCase().trim()}`);
  return raw ? (JSON.parse(raw) as User) : null;
}

// ── Session management ────────────────────────────────────────────────────────

export async function createSession(user: User): Promise<string> {
  const redis = await getRedis();
  const token = randomBytes(32).toString("hex");
  const now = new Date().toISOString();

  const session: Session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    createdAt: now,
    lastSeenAt: now,
  };

  // Track session ID on user so we can invalidate all sessions later
  await redis.sAdd(`user:sessions:${user.id}`, token);
  await redis.set(`session:${token}`, JSON.stringify(session), { EX: SESSION_TTL });
  return token;
}

export async function getSession(token: string): Promise<Session | null> {
  if (!token || token.length !== 64) return null; // 32 bytes = 64 hex chars
  const redis = await getRedis();
  const raw = await redis.get(`session:${token}`);
  if (!raw) return null;

  const session = JSON.parse(raw) as Session;

  // Rolling expiry — refresh TTL on each use
  const updatedSession: Session = { ...session, lastSeenAt: new Date().toISOString() };
  await redis.set(`session:${token}`, JSON.stringify(updatedSession), { EX: SESSION_TTL });

  return updatedSession;
}

export async function deleteSession(token: string): Promise<void> {
  if (!token) return;
  const redis = await getRedis();
  const raw = await redis.get(`session:${token}`);
  if (raw) {
    const session = JSON.parse(raw) as Session;
    // Remove from user's session set too
    await redis.sRem(`user:sessions:${session.userId}`, token);
  }
  await redis.del(`session:${token}`);
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  const redis = await getRedis();
  const tokens = await redis.sMembers(`user:sessions:${userId}`);
  if (tokens.length > 0) {
    const multi = redis.multi();
    tokens.forEach((t) => multi.del(`session:${t}`));
    multi.del(`user:sessions:${userId}`);
    await multi.exec();
  }
}

// ── Current user (server-side) ────────────────────────────────────────────────

export async function getCurrentUser(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return await getSession(token);
  } catch {
    return null;
  }
}
