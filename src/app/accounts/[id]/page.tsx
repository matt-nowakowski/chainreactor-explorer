import { notFound } from "next/navigation";
import Link from "next/link";
import { getAccountBalance } from "@/lib/sidecar";
import { formatBalance, truncateHash } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let balance;
  try {
    balance = await getAccountBalance(id);
  } catch {
    notFound();
  }

  const symbol = balance.tokenSymbol || process.env.NEXT_PUBLIC_TOKEN_SYMBOL || "TOKEN";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
            Blocks
          </Link>
          <span className="text-xs text-muted-foreground">/</span>
          <span className="text-xs font-medium">Account</span>
        </div>
        <h1 className="mt-1 flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="font-mono text-sm">{truncateHash(id, 12)}</span>
          <CopyButton value={id} />
        </h1>
      </div>

      {/* Balance card */}
      <div className="rounded-lg border p-4 space-y-3">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Balance
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <BalanceCard label="Free" value={balance.free} symbol={symbol} />
          <BalanceCard label="Reserved" value={balance.reserved} symbol={symbol} />
          <BalanceCard label="Frozen" value={balance.frozen} symbol={symbol} />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 rounded-lg border p-4">
        <DetailRow label="Address" value={id} mono />
        <DetailRow label="Nonce" value={balance.nonce} />
        <DetailRow label="At Block" value={`#${Number(balance.at.height).toLocaleString()}`} />
      </div>

      {/* Info note */}
      <div className="rounded-lg border border-dashed p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Transaction history requires an indexer and is not available in the current explorer version.
        </p>
      </div>
    </div>
  );
}

function BalanceCard({
  label,
  value,
  symbol,
}: {
  label: string;
  value: string;
  symbol: string;
}) {
  return (
    <div className="rounded-md border bg-muted/20 px-4 py-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-medium tabular-nums">
        {formatBalance(value)} <span className="text-xs text-muted-foreground">{symbol}</span>
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs text-right break-all ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}
