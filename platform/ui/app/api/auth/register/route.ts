import { NextRequest, NextResponse } from "next/server";
import { createUser, createSession, checkRateLimit, SESSION_COOKIE } from "@/lib/auth";

const NAME_RE = /^[a-zA-Z\s'\-\.]{2,80}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown";

  const rl = await checkRateLimit(`register:${ip}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, password } = (body as Record<string, unknown>) ?? {};

  // Validate name
  if (typeof name !== "string" || !NAME_RE.test(name.trim())) {
    return NextResponse.json(
      { error: "Name must be 2–80 characters and contain only letters, spaces, hyphens, or apostrophes" },
      { status: 400 }
    );
  }

  // Validate email
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Validate password
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (password.length > 128) {
    return NextResponse.json({ error: "Password too long" }, { status: 400 });
  }

  try {
    const user = await createUser(name, email, password);
    const token = await createSession(user);

    const res = NextResponse.json(
      { ok: true, user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    );
    res.cookies.set(SESSION_COOKIE, token, cookieOpts(60 * 60 * 24 * 7));
    return res;
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }
    console.error("[auth/register]", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
