import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, verifyPassword, createSession, checkRateLimit, SESSION_COOKIE } from "@/lib/auth";

function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    secure: process.env.NODE_ENV === "production",
  };
}

// Constant-time dummy hash to run verifyPassword against even when no user found.
// Prevents timing attacks that reveal whether an email is registered.
const DUMMY_HASH = "0000000000000000000000000000000000000000000000000000000000000000:0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

export async function POST(req: NextRequest) {
  // Rate limit per IP (strict: 10/min) and per email (5/min) to slow brute force
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown";

  const ipRl = await checkRateLimit(`login:ip:${ip}`);
  if (!ipRl.ok) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, password } = (body as Record<string, unknown>) ?? {};

  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (typeof password !== "string" || !password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  // Per-email rate limit (tighter: 5/min)
  const emailRl = await checkRateLimit(`login:email:${email.toLowerCase().trim()}`);
  if (!emailRl.ok) {
    return NextResponse.json(
      { error: "Too many login attempts for this account. Please wait a minute." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const user = await findUserByEmail(email);

    // Always run verifyPassword to prevent timing-based email enumeration
    const valid = user
      ? verifyPassword(password, user.passwordHash)
      : verifyPassword(password, DUMMY_HASH);

    if (!user || !valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await createSession(user);
    const res = NextResponse.json(
      { ok: true, user: { id: user.id, name: user.name, email: user.email } }
    );
    res.cookies.set(SESSION_COOKIE, token, cookieOpts(60 * 60 * 24 * 7));
    return res;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
