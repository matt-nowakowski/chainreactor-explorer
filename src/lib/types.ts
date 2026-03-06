/** Sidecar block response */
export interface SidecarBlock {
  number: string;
  hash: string;
  parentHash: string;
  stateRoot: string;
  extrinsicsRoot: string;
  authorId?: string;
  logs: Array<{ type: string; index: string; value: string }>;
  onInitialize: { events: SidecarEvent[] };
  extrinsics: SidecarExtrinsic[];
  onFinalize: { events: SidecarEvent[] };
  finalized?: boolean;
}

export interface SidecarExtrinsic {
  method: {
    pallet: string;
    method: string;
  };
  signature: {
    signer: { id: string } | null;
    signature?: { value: string } | null;
  } | null;
  nonce: string | null;
  args: Record<string, unknown>;
  tip: string | null;
  hash: string;
  info: Record<string, unknown>;
  events: SidecarEvent[];
  success: boolean;
  paysFee: boolean;
}

export interface SidecarEvent {
  method: {
    pallet: string;
    method: string;
  };
  data: unknown[];
}

/** Sidecar account balance response */
export interface SidecarAccountBalance {
  at: { hash: string; height: string };
  nonce: string;
  tokenSymbol: string;
  free: string;
  reserved: string;
  frozen: string;
  flags: string;
}

/** Sidecar node version response */
export interface SidecarNodeVersion {
  clientVersion: string;
  clientImplName: string;
  chain: string;
  specName: string;
  specVersion: string;
}

/** Sidecar runtime spec response */
export interface SidecarRuntimeSpec {
  at: { hash: string; height: string };
  authoringVersion: string;
  transactionVersion: string;
  implVersion: string;
  specName: string;
  specVersion: string;
  properties: {
    ss58Format: string;
    tokenDecimals: string[];
    tokenSymbol: string[];
  };
}

/** Sidecar node network response */
export interface SidecarNodeNetwork {
  nodeRoles: string[];
  numPeers: string;
  isSyncing: boolean;
  shouldHavePeers: boolean;
  localPeerId: string;
  localListenAddresses: string[];
}

/** Sidecar generic storage item response */
export interface SidecarStorageItem {
  at: { hash: string; height: string };
  pallet: string;
  palletIndex: string;
  storageItem: string;
  value: unknown;
}

/** Parsed block for display */
export interface BlockSummary {
  number: number;
  hash: string;
  parentHash: string;
  extrinsicCount: number;
  eventCount: number;
  timestamp: number | null;
  authorId: string | null;
  finalized: boolean;
}

/** Extrinsic with block context for list views */
export interface ExtrinsicSummary {
  blockNumber: number;
  extrinsicIndex: number;
  method: { pallet: string; method: string };
  signer: string | null;
  success: boolean;
  hash: string;
  timestamp: number | null;
}

/** Event with block context for list views */
export interface EventSummary {
  blockNumber: number;
  eventIndex: number;
  extrinsicIndex: number | null;
  method: { pallet: string; method: string };
  data: unknown[];
  timestamp: number | null;
}

/** Transfer extracted from balances.Transfer events */
export interface TransferSummary {
  blockNumber: number;
  extrinsicIndex: number;
  from: string;
  to: string;
  amount: string;
  timestamp: number | null;
  success: boolean;
}

/** Aggregated network stats for dashboard */
export interface NetworkStats {
  blockHeight: number;
  finalizedHeight: number;
  totalIssuance: string;
  validatorCount: number;
  peerCount: number;
  avgBlockTime: number;
  specVersion: string;
  specName: string;
  chainName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  isSyncing: boolean;
}
