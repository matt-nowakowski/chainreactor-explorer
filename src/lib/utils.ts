/** Truncate a hex hash for display: 0x1234...abcd */
export function truncateHash(hash: string, chars: number = 8): string {
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

/** Truncate an SS58 address: 5GrwVa...3sFce */
export function truncateAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/** Format a balance from raw units */
export function formatBalance(raw: string, decimals: number = 18, precision: number = 4): string {
  const value = Number(raw) / Math.pow(10, decimals);
  if (value === 0) return "0";
  if (value < 0.0001) return "< 0.0001";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  });
}

/** Format a timestamp (ms) to relative time: "12s ago", "5m ago" */
export function timeAgo(timestampMs: number): string {
  const seconds = Math.floor((Date.now() - timestampMs) / 1000);
  if (seconds < 0) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Format a method as Pallet.method */
export function formatMethod(pallet: string, method: string): string {
  return `${pallet}.${method}`;
}

/** Format a timestamp (ms) to ISO UTC string */
export function formatTimestamp(timestampMs: number): string {
  return new Date(timestampMs).toISOString().replace("T", " ").replace("Z", " UTC");
}

/** Format large numbers with commas */
export function formatNumber(n: number | string): string {
  return Number(n).toLocaleString();
}

/** Calculate average block time from an array of timestamps (ms, newest first) */
export function calculateAvgBlockTime(timestamps: number[]): number {
  if (timestamps.length < 2) return 6000;
  const diffs: number[] = [];
  for (let i = 0; i < timestamps.length - 1; i++) {
    const diff = timestamps[i] - timestamps[i + 1];
    if (diff > 0) diffs.push(diff);
  }
  if (diffs.length === 0) return 6000;
  return diffs.reduce((a, b) => a + b, 0) / diffs.length;
}
