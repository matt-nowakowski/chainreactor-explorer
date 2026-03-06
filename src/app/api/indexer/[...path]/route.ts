import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const INDEXER_URL = process.env.INDEXER_URL || "";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!INDEXER_URL) {
    return NextResponse.json({ error: "Indexer not configured" }, { status: 503 });
  }

  const { path } = await params;
  const target = `${INDEXER_URL}/${path.join("/")}${req.nextUrl.search}`;

  try {
    const res = await fetch(target, { next: { revalidate: 0 } });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Indexer unreachable" },
      { status: 502 }
    );
  }
}
