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
