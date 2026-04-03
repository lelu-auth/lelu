import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "redis";

const KEYS_PER_HOUR_LIMIT = 5;
const KEYS_PER_DAY_LIMIT = 10;
const KEY_EXPIRATION_DAYS = 30;

// Redis client singleton
let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_ADDR || "redis://localhost:6379";
    redisClient = createClient({
      url: redisUrl.startsWith("redis://") ? redisUrl : `redis://${redisUrl}`,
    });

    redisClient.on("error", (err) => console.error("Redis Client Error:", err));

    await redisClient.connect();
  }

  return redisClient;
}

function getClientIP(request: NextRequest): string {
  const headersList = headers();

  // Check various headers for the real IP
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIP = headersList.get("x-real-ip");
  const cfConnectingIP = headersList.get("cf-connecting-ip");

  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  return "unknown";
}

function generateAnonymousKey(): string {
  // Generate 8-character short ID using crypto-secure random
  const shortIdBytes = new Uint8Array(6);
  crypto.getRandomValues(shortIdBytes);
  const shortId = Buffer.from(shortIdBytes).toString("base64url").substring(0, 8);

  // Generate 32-character random string using crypto-secure random
  const randomBytes = new Uint8Array(24);
  crypto.getRandomValues(randomBytes);
  const randomPart = Buffer.from(randomBytes).toString("base64url").substring(0, 32);

  return `lelu_anon_${shortId}_${randomPart}`;
}

async function checkIPRateLimit(ip: string): Promise<{ allowed: boolean; error?: string }> {
  try {
    const redis = await getRedisClient();
    const now = new Date();

    // Check hourly limit
    const hourKey = `lelu:ip:gen:hour:${ip}:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}`;
    const hourCount = await redis.get(hourKey);

    if (hourCount && parseInt(hourCount) >= KEYS_PER_HOUR_LIMIT) {
      return {
        allowed: false,
        error: `Rate limit exceeded: maximum ${KEYS_PER_HOUR_LIMIT} keys per hour`,
      };
    }

    // Check daily limit
    const dayKey = `lelu:ip:gen:day:${ip}:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const dayCount = await redis.get(dayKey);

    if (dayCount && parseInt(dayCount) >= KEYS_PER_DAY_LIMIT) {
      return {
        allowed: false,
        error: `Rate limit exceeded: maximum ${KEYS_PER_DAY_LIMIT} keys per day`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fail open to avoid blocking users if Redis is down
    return { allowed: true };
  }
}

async function incrementIPCounter(ip: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    const now = new Date();

    // Increment hourly counter
    const hourKey = `lelu:ip:gen:hour:${ip}:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}`;
    await redis.incr(hourKey);
    await redis.expire(hourKey, 7200); // 2 hours

    // Increment daily counter
    const dayKey = `lelu:ip:gen:day:${ip}:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    await redis.incr(dayKey);
    await redis.expire(dayKey, 172800); // 48 hours
  } catch (error) {
    console.error("Failed to increment IP counter:", error);
  }
}

async function storeAnonymousKey(apiKey: string, ip: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    const shortId = apiKey.split("_")[2]; // Extract short ID from key
    const tenantId = `anon_${shortId}`;

    const metadata = {
      tenant_id: tenantId,
      key_id: shortId,
      created_at: new Date().toISOString(),
      revoked: false,
      name: "Anonymous Beta Key",
      env: "anon",
      created_ip: ip,
      is_anonymous: true,
    };

    // Store key with 30-day expiration
    const redisKey = `lelu:apikey:${apiKey}`;
    await redis.set(redisKey, JSON.stringify(metadata), {
      EX: KEY_EXPIRATION_DAYS * 24 * 60 * 60, // 30 days in seconds
    });

    console.log(`Stored anonymous key: ${apiKey} for tenant: ${tenantId}`);
  } catch (error) {
    console.error("Failed to store anonymous key:", error);
    throw new Error("Failed to store key in database");
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    if (ip === "unknown") {
      return NextResponse.json({ error: "Unable to determine client IP" }, { status: 400 });
    }

    // Check IP rate limit
    const rateLimitCheck = await checkIPRateLimit(ip);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: rateLimitCheck.error || "Rate limit exceeded. Please try again later.",
          retryAfter: 3600, // 1 hour in seconds
        },
        { status: 429 },
      );
    }

    // Generate anonymous key
    const apiKey = generateAnonymousKey();
    const shortId = apiKey.split("_")[2]; // Extract short ID
    const tenantId = `anon_${shortId}`;

    // Store key with IP binding in Redis
    await storeAnonymousKey(apiKey, ip);

    // Increment IP counters for rate limiting
    await incrementIPCounter(ip);

    return NextResponse.json({
      apiKey,
      tenantId,
      limits: {
        dailyRequests: 500,
        minuteRequests: 10,
        dailyTokenMints: 50,
      },
      expiresIn: "30 days (with activity)",
      message: "Save this key - you won't see it again!",
    });
  } catch (error) {
    console.error("Failed to generate anonymous key:", error);
    return NextResponse.json(
      { error: "Failed to generate key. Please try again." },
      { status: 500 },
    );
  }
}
