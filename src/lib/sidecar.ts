import type {
  SidecarBlock,
  SidecarExtrinsic,
  SidecarAccountBalance,
  SidecarNodeVersion,
  SidecarRuntimeSpec,
  SidecarNodeNetwork,
  SidecarStorageItem,
  BlockSummary,
  ExtrinsicSummary,
  EventSummary,
  TransferSummary,
} from "./types";

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

// ─── Block Endpoints ────────────────────────────────────────────

export async function getLatestBlock(): Promise<SidecarBlock> {
  return sidecarFetch<SidecarBlock>("/blocks/head");
}

export async function getBlock(id: string | number): Promise<SidecarBlock> {
  return sidecarFetch<SidecarBlock>(`/blocks/${id}`);
}

export async function getFinalizedHead(): Promise<SidecarBlock> {
  return sidecarFetch<SidecarBlock>("/blocks/head?finalized=true");
}

export async function getBlockRange(from: number, to: number): Promise<SidecarBlock[]> {
  // Sidecar returns array of blocks for range queries
  return sidecarFetch<SidecarBlock[]>(`/blocks?range=${from}-${to}&noFees=true`);
}

export async function getExtrinsic(blockId: number, index: number): Promise<SidecarExtrinsic> {
  return sidecarFetch<SidecarExtrinsic>(`/blocks/${blockId}/extrinsics/${index}`);
}

// ─── Account Endpoints ──────────────────────────────────────────

export async function getAccountBalance(address: string): Promise<SidecarAccountBalance> {
  return sidecarFetch<SidecarAccountBalance>(`/accounts/${address}/balance-info`);
}

// ─── Node Endpoints ─────────────────────────────────────────────

export async function getNodeVersion(): Promise<SidecarNodeVersion> {
  return sidecarFetch<SidecarNodeVersion>("/node/version");
}

export async function getNodeNetwork(): Promise<SidecarNodeNetwork> {
  return sidecarFetch<SidecarNodeNetwork>("/node/network");
}

export async function getTransactionPool(): Promise<{ pool: unknown[] }> {
  return sidecarFetch<{ pool: unknown[] }>("/node/transaction-pool");
}

// ─── Runtime Endpoints ──────────────────────────────────────────

export async function getRuntimeSpec(): Promise<SidecarRuntimeSpec> {
  return sidecarFetch<SidecarRuntimeSpec>("/runtime/spec");
}

// ─── Pallet Storage ─────────────────────────────────────────────

export async function getPalletStorage(palletId: string, storageItem: string): Promise<SidecarStorageItem> {
  return sidecarFetch<SidecarStorageItem>(`/pallets/${palletId}/storage/${storageItem}`);
}

export async function getAuthorities(): Promise<SidecarStorageItem> {
  return sidecarFetch<SidecarStorageItem>("/pallets/aura/storage/authorities");
}

export async function getTotalIssuance(): Promise<SidecarStorageItem> {
  return sidecarFetch<SidecarStorageItem>("/pallets/balances/storage/totalIssuance");
}

// ─── Block Parsing Helpers ──────────────────────────────────────

/** Extract timestamp from a block's timestamp.set extrinsic */
export function extractTimestamp(block: SidecarBlock): number | null {
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

/** Extract extrinsics from a block into summary form */
export function extractExtrinsics(block: SidecarBlock): ExtrinsicSummary[] {
  const ts = extractTimestamp(block);
  return block.extrinsics.map((ext, i) => ({
    blockNumber: Number(block.number),
    extrinsicIndex: i,
    method: ext.method,
    signer: ext.signature?.signer?.id || null,
    success: ext.success,
    hash: ext.hash,
    timestamp: ts,
  }));
}

/** Extract all events from a block into summary form */
export function extractEvents(block: SidecarBlock): EventSummary[] {
  const ts = extractTimestamp(block);
  const events: EventSummary[] = [];
  let idx = 0;

  for (const evt of block.onInitialize.events) {
    events.push({
      blockNumber: Number(block.number),
      eventIndex: idx++,
      extrinsicIndex: null,
      method: evt.method,
      data: evt.data,
      timestamp: ts,
    });
  }

  for (let extIdx = 0; extIdx < block.extrinsics.length; extIdx++) {
    for (const evt of block.extrinsics[extIdx].events) {
      events.push({
        blockNumber: Number(block.number),
        eventIndex: idx++,
        extrinsicIndex: extIdx,
        method: evt.method,
        data: evt.data,
        timestamp: ts,
      });
    }
  }

  for (const evt of block.onFinalize.events) {
    events.push({
      blockNumber: Number(block.number),
      eventIndex: idx++,
      extrinsicIndex: null,
      method: evt.method,
      data: evt.data,
      timestamp: ts,
    });
  }

  return events;
}

/** Extract transfers from a block (balances.Transfer events) */
export function extractTransfers(block: SidecarBlock): TransferSummary[] {
  const ts = extractTimestamp(block);
  const transfers: TransferSummary[] = [];

  for (let extIdx = 0; extIdx < block.extrinsics.length; extIdx++) {
    const ext = block.extrinsics[extIdx];
    for (const evt of ext.events) {
      if (evt.method.pallet === "balances" && evt.method.method === "Transfer") {
        // Event data: [from, to, amount]
        const [from, to, amount] = evt.data as [string, string, string];
        if (from && to && amount) {
          transfers.push({
            blockNumber: Number(block.number),
            extrinsicIndex: extIdx,
            from: String(from),
            to: String(to),
            amount: String(amount),
            timestamp: ts,
            success: ext.success,
          });
        }
      }
    }
  }

  return transfers;
}

/** Fetch the last N blocks starting from the head */
export async function getRecentBlocks(count: number = 20): Promise<BlockSummary[]> {
  const head = await getLatestBlock();
  const headNum = Number(head.number);
  const start = Math.max(0, headNum - count + 1);

  try {
    // Try range endpoint (single request)
    const blocks = await getBlockRange(start, headNum);
    return blocks.map(toBlockSummary).sort((a, b) => b.number - a.number);
  } catch {
    // Fallback: individual fetches
    const promises: Promise<SidecarBlock>[] = [];
    for (let i = headNum; i >= start; i--) {
      promises.push(getBlock(i));
    }
    const blocks = await Promise.all(promises);
    return blocks.map(toBlockSummary);
  }
}
