import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listPolicies, createPolicy } from "@/lib/policies";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const policies = await listPolicies(session.userId);
    return NextResponse.json({ policies });
  } catch (err) {
    console.error("[policies/GET]", err);
    return NextResponse.json({ error: "Failed to fetch policies" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, description, rules } = (body as Record<string, unknown>) ?? {};

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Policy name is required" }, { status: 400 });
  }
  if (name.length > 64) {
    return NextResponse.json({ error: "Name must be 64 characters or less" }, { status: 400 });
  }

  try {
    const policy = await createPolicy(
      session.userId,
      name.trim(),
      typeof description === "string" ? description.trim() : "",
      Array.isArray(rules) ? rules : [],
    );
    return NextResponse.json({ policy }, { status: 201 });
  } catch (err) {
    console.error("[policies/POST]", err);
    return NextResponse.json({ error: "Failed to create policy" }, { status: 500 });
  }
}
