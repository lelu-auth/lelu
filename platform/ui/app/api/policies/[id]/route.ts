import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPolicy, updatePolicy, deletePolicy } from "@/lib/policies";
import { pushPolicyToEngine } from "@/lib/policy-sync";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const policy = await getPolicy(params.id, session.userId);
  if (!policy) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ policy });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, description, rules, isActive } = (body as Record<string, unknown>) ?? {};

  try {
    const policy = await updatePolicy(params.id, session.userId, {
      ...(typeof name === "string" ? { name: name.trim() } : {}),
      ...(typeof description === "string" ? { description: description.trim() } : {}),
      ...(Array.isArray(rules) ? { rules } : {}),
      ...(typeof isActive === "boolean" ? { isActive } : {}),
    });
    if (!policy) return NextResponse.json({ error: "Not found" }, { status: 404 });

    pushPolicyToEngine(session.userId).then((result) => {
      if (!result.ok) console.warn("[policies/PUT] engine sync failed:", result.error);
    }).catch((err) => console.warn("[policies/PUT] engine sync error:", err));

    return NextResponse.json({ policy });
  } catch (err) {
    console.error("[policies/PUT]", err);
    return NextResponse.json({ error: "Failed to update policy" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await deletePolicy(params.id, session.userId);

    pushPolicyToEngine(session.userId).then((result) => {
      if (!result.ok) console.warn("[policies/DELETE] engine sync failed:", result.error);
    }).catch((err) => console.warn("[policies/DELETE] engine sync error:", err));

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("[policies/DELETE]", err);
    return NextResponse.json({ error: "Failed to delete policy" }, { status: 500 });
  }
}
