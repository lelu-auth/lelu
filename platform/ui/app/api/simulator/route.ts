import { NextRequest, NextResponse } from "next/server";

const ENGINE_URL = process.env.LELU_ENGINE_URL ?? process.env.LELU_ENGINE_URL ?? "http://localhost:8082";
const ENGINE_API_KEY = process.env.LELU_API_KEY ?? process.env.LELU_API_KEY ?? "lelu-dev-key";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${ENGINE_URL}/v1/simulator/replay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENGINE_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
