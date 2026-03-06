import { NextResponse } from "next/server";
import { getAuthorities } from "@/lib/sidecar";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getAuthorities();
    const validators = Array.isArray(result.value) ? result.value as string[] : [];

    return NextResponse.json({
      validators,
      count: validators.length,
      at: result.at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch validators";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
