import { NextRequest, NextResponse } from "next/server";
import { createClient } from "redis";

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const apiKey = searchParams.get("key");
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }
    
    // Validate key format
    if (!apiKey.startsWith("lelu_anon_")) {
      return NextResponse.json(
        { error: "Invalid anonymous key format" },
        { status: 400 }
      );
    }
    
    const redis = await getRedisClient();
    
    // Check if key exists in Redis
    const keyData = await redis.get(`lelu:apikey:${apiKey}`);
    if (!keyData) {
      return NextResponse.json(
        { error: "API key not found or expired" },
        { status: 404 }
      );
    }
    
    const metadata = JSON.parse(keyData);
    
    // Check if key is revoked
    if (metadata.revoked) {
      return NextResponse.json(
        { error: "API key has been revoked" },
        { status: 403 }
      );
    }
    
    const tenantId = metadata.tenant_id;
    const now = new Date();
    
    // Get daily request count
    const dayKey = `lelu:usage:day:${tenantId}:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const dailyRequests = await redis.get(dayKey);
    
    // Get minute request count
    const minuteKey = `lelu:usage:minute:${tenantId}:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const minuteRequests = await redis.get(minuteKey);
    
    // Get token mint count
    const tokenMintKey = `lelu:tokens:day:${tenantId}:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const tokenMints = await redis.get(tokenMintKey);
    
    // Get TTL for the key
    const ttl = await redis.ttl(`lelu:apikey:${apiKey}`);
    const expiresAt = ttl > 0 ? new Date(Date.now() + ttl * 1000).toISOString() : null;
    
    const usage = {
      requests: parseInt(dailyRequests || "0"),
      dailyLimit: 500,
      minuteLimit: 10,
      requestsThisMinute: parseInt(minuteRequests || "0"),
      tokenMints: parseInt(tokenMints || "0"),
      tokenMintLimit: 50,
      resetAt: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
      expiresAt,
      createdAt: metadata.created_at,
      tenantId: metadata.tenant_id,
    };
    
    return NextResponse.json(usage);
  } catch (error) {
    console.error("Failed to fetch usage stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage stats" },
      { status: 500 }
    );
  }
}

