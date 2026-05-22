import { createClient } from "redis";
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
}

const SESSION_COOKIE = "lelu_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

let _redis: ReturnType<typeof createClient> | null = null;

async function getRedis() {
  if (!_redis) {
    const url = process.env.REDIS_URL || process.env.REDIS_ADDR || "redis://localhost:6379";
    _redis = createClient({ url: url.startsWith("redis://") ? url : `redis://${url}` });
    _redis.on("error", () => { _redis = null; });
    await _redis.connect();
  }
  return _redis;
}

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

export async function createUser(name: string, email: string, password: string): Promise<User> {
  const redis = await getRedis();
  const existing = await redis.get(`user:email:${email.toLowerCase()}`);
  if (existing) throw new Error("Email already registered");

  const user: User = {
    id: randomBytes(16).toString("hex"),
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  await redis.set(`user:email:${user.email}`, JSON.stringify(user));
  await redis.set(`user:id:${user.id}`, JSON.stringify(user));
  return user;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const redis = await getRedis();
  const raw = await redis.get(`user:email:${email.toLowerCase()}`);
  return raw ? (JSON.parse(raw) as User) : null;
}

export async function createSession(user: User): Promise<string> {
  const redis = await getRedis();
  const token = randomBytes(32).toString("hex");
  const session: Session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    createdAt: new Date().toISOString(),
  };
  await redis.set(`session:${token}`, JSON.stringify(session), { EX: SESSION_TTL_SECONDS });
  return token;
}

export async function getSession(token: string): Promise<Session | null> {
  const redis = await getRedis();
  const raw = await redis.get(`session:${token}`);
  return raw ? (JSON.parse(raw) as Session) : null;
}

export async function deleteSession(token: string): Promise<void> {
  const redis = await getRedis();
  await redis.del(`session:${token}`);
}

export async function getCurrentUser(): Promise<Session | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await getSession(token);
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };
