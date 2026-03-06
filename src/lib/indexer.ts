const INDEXER_URL = process.env.INDEXER_URL || "";

export function isIndexerConfigured(): boolean {
  return INDEXER_URL.length > 0;
}

async function indexerFetch<T>(path: string): Promise<T> {
  if (!INDEXER_URL) throw new Error("Indexer not configured");
  const res = await fetch(`${INDEXER_URL}${path}`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Indexer ${path}: ${res.status}`);
  return res.json();
}

// ─── Status ──────────────────────────────────────────────────────

export interface IndexerStatus {
  syncing: boolean;
  lastIndexedBlock: number;
  chainHead: number;
  behind: number;
  wsUrl: string;
  totalBlocks: number;
  totalExtrinsics: number;
  totalEvents: number;
  totalTransfers: number;
}

export async function getIndexerStatus(): Promise<IndexerStatus> {
  return indexerFetch<IndexerStatus>("/status");
}

// ─── Blocks ──────────────────────────────────────────────────────

export interface IndexedBlock {
  number: number;
  hash: string;
  parent_hash: string;
  state_root: string;
  extrinsics_root: string;
  author: string | null;
  extrinsic_count: number;
  event_count: number;
  timestamp: number | null;
}

export async function getIndexedBlocks(limit = 25, page = 1) {
  return indexerFetch<{ blocks: IndexedBlock[]; total: number; limit: number; offset: number }>(
    `/blocks?limit=${limit}&page=${page}`
  );
}

// ─── Extrinsics ──────────────────────────────────────────────────

export interface IndexedExtrinsic {
  block_number: number;
  extrinsic_index: number;
  pallet: string;
  method: string;
  signer: string | null;
  args: string | null;
  hash: string;
  success: boolean;
  fee: string | null;
  timestamp: number | null;
}

export async function getIndexedExtrinsics(limit = 25, page = 1) {
  return indexerFetch<{ extrinsics: IndexedExtrinsic[]; total: number; limit: number; offset: number }>(
    `/extrinsics?limit=${limit}&page=${page}`
  );
}

// ─── Events ──────────────────────────────────────────────────────

export interface IndexedEvent {
  block_number: number;
  event_index: number;
  extrinsic_index: number | null;
  pallet: string;
  method: string;
  data: string | null;
  timestamp: number | null;
}

export async function getIndexedEvents(limit = 25, page = 1, pallet?: string, method?: string) {
  let url = `/events?limit=${limit}&page=${page}`;
  if (pallet) url += `&pallet=${encodeURIComponent(pallet)}`;
  if (method) url += `&method=${encodeURIComponent(method)}`;
  return indexerFetch<{ events: IndexedEvent[]; total: number; limit: number; offset: number }>(url);
}

// ─── Transfers ───────────────────────────────────────────────────

export interface IndexedTransfer {
  block_number: number;
  extrinsic_index: number;
  from_address: string;
  to_address: string;
  amount: string;
  success: boolean;
  timestamp: number | null;
}

export async function getIndexedTransfers(limit = 25, page = 1) {
  return indexerFetch<{ transfers: IndexedTransfer[]; total: number; limit: number; offset: number }>(
    `/transfers?limit=${limit}&page=${page}`
  );
}

// ─── Account ─────────────────────────────────────────────────────

export async function getAccountExtrinsics(address: string, limit = 25, page = 1) {
  return indexerFetch<{ extrinsics: IndexedExtrinsic[]; total: number; limit: number; offset: number }>(
    `/accounts/${address}/extrinsics?limit=${limit}&page=${page}`
  );
}

export async function getAccountTransfers(address: string, limit = 25, page = 1) {
  return indexerFetch<{ transfers: IndexedTransfer[]; total: number; limit: number; offset: number }>(
    `/accounts/${address}/transfers?limit=${limit}&page=${page}`
  );
}

// ─── Search ──────────────────────────────────────────────────────

export interface SearchResult {
  type: "block" | "extrinsic" | "account";
  value: string | number;
  extrinsics?: number;
  transfers?: number;
}

export async function searchIndexer(query: string) {
  return indexerFetch<{ result: SearchResult | null }>(
    `/search?q=${encodeURIComponent(query)}`
  );
}
