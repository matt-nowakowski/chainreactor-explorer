import type { SidecarBlock, SidecarAccountBalance, SidecarNodeVersion, BlockSummary } from "./types";

const SIDECAR_URL = process.env.SIDECAR_URL || "http://sidecar:8080";

async function sidecarFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${SIDECAR_URL}${path}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`Sidecar ${path}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getLatestBlock(): Promise<SidecarBlock> {
  return sidecarFetch<SidecarBlock>("/blocks/head");
}

export async function getBlock(id: string | number): Promise<SidecarBlock> {
  return sidecarFetch<SidecarBlock>(`/blocks/${id}`);
}

export async function getFinalizedHead(): Promise<SidecarBlock> {
  return sidecarFetch<SidecarBlock>("/blocks/head?finalized=true");
}

export async function getAccountBalance(address: string): Promise<SidecarAccountBalance> {
  return sidecarFetch<SidecarAccountBalance>(`/accounts/${address}/balance-info`);
}

export async function getNodeVersion(): Promise<SidecarNodeVersion> {
  return sidecarFetch<SidecarNodeVersion>("/node/version");
}

/** Extract timestamp from a block's timestamp.set extrinsic */
function extractTimestamp(block: SidecarBlock): number | null {
  for (const ext of block.extrinsics) {
    if (ext.method.pallet === "timestamp" && ext.method.method === "set") {
      const now = ext.args?.now;
      if (typeof now === "string" || typeof now === "number") {
        return Number(now);
      }
    }
  }
  return null;
}

/** Count all events across a block */
function countEvents(block: SidecarBlock): number {
  let count = block.onInitialize.events.length + block.onFinalize.events.length;
  for (const ext of block.extrinsics) {
    count += ext.events.length;
  }
  return count;
}

/** Convert a Sidecar block to a display-friendly summary */
export function toBlockSummary(block: SidecarBlock): BlockSummary {
  return {
    number: Number(block.number),
    hash: block.hash,
    parentHash: block.parentHash,
    extrinsicCount: block.extrinsics.length,
    eventCount: countEvents(block),
    timestamp: extractTimestamp(block),
    authorId: block.authorId || null,
    finalized: block.finalized ?? false,
  };
}

/** Fetch the last N blocks starting from the head */
export async function getRecentBlocks(count: number = 20): Promise<BlockSummary[]> {
  const head = await getLatestBlock();
  const headNum = Number(head.number);
  const start = Math.max(0, headNum - count + 1);

  const promises: Promise<SidecarBlock>[] = [];
  for (let i = headNum; i >= start; i--) {
    promises.push(getBlock(i));
  }

  const blocks = await Promise.all(promises);
  return blocks.map(toBlockSummary);
}
