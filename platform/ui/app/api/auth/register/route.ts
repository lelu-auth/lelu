import { NextRequest, NextResponse } from "next/server";
import { createUser, createVerificationToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

const NAME_RE = /^[a-zA-Z\s'\-.]{2,80}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, password } = (body as Record<string, unknown>) ?? {};

  if (typeof name !== "string" || !NAME_RE.test(name.trim())) {
    return NextResponse.json(
      { error: "Name must be 2–80 characters (letters, spaces, hyphens, apostrophes)" },
      { status: 400 }
    );
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (password.length > 128) {
    return NextResponse.json({ error: "Password too long" }, { status: 400 });
  }

  // Step 1: create user (fatal — if this fails, stop)
  let user: Awaited<ReturnType<typeof createUser>>;
  try {
    user = await createUser(name.trim(), email.trim(), password);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }
    console.error("[auth/register] createUser failed:", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }

  // Step 2: send verification email (non-fatal — user is created regardless)
  try {
    const token = await createVerificationToken(user.id);
    await sendVerificationEmail(user.email, user.name, token);
  } catch (err) {
    console.error("[auth/register] Email send failed (non-fatal):", err);
    // User is created; they can request a resend. Don't return 500.
  }

  return NextResponse.json(
    { ok: true, needsVerification: true },
    { status: 201 }
  );
}
