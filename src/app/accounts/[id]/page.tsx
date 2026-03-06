import { notFound } from "next/navigation";
import Link from "next/link";
import { getAccountBalance, getRuntimeSpec, getAuthorities } from "@/lib/sidecar";
import { formatBalance, truncateHash } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { DetailRow } from "@/components/detail-row";
import { Badge } from "@/components/badge";

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

  // Fetch runtime spec for accurate decimals and check if validator
  const [spec, authResult] = await Promise.all([
    getRuntimeSpec().catch(() => null),
    getAuthorities().catch(() => null),
  ]);

  const tokenDecimals = Number(spec?.properties?.tokenDecimals?.[0] || "18");
  const tokenSymbol = spec?.properties?.tokenSymbol?.[0] || balance.tokenSymbol || "TOKEN";

  // Check if this address is in the validator set
  const validators = authResult && Array.isArray(authResult.value) ? (authResult.value as string[]) : [];
  const isValidator = validators.includes(id);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <span className="text-xs text-muted-foreground">/</span>
          <span className="text-xs font-medium">Account</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <h1 className="font-mono text-sm font-semibold tracking-tight">
            {truncateHash(id, 12)}
          </h1>
          <CopyButton value={id} />
          {isValidator && (
            <Badge variant="primary">Validator</Badge>
          )}
        </div>
      </div>

      {/* Balance card */}
      <div className="rounded-lg border p-4 space-y-3">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Balance
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <BalanceCard label="Free" value={balance.free} decimals={tokenDecimals} symbol={tokenSymbol} />
          <BalanceCard label="Reserved" value={balance.reserved} decimals={tokenDecimals} symbol={tokenSymbol} />
          <BalanceCard label="Frozen" value={balance.frozen} decimals={tokenDecimals} symbol={tokenSymbol} />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-0.5 rounded-lg border p-4">
        <DetailRow label="Address" value={id} mono copy />
        <DetailRow label="Nonce" value={balance.nonce} />
        <DetailRow
          label="At Block"
          value={`#${Number(balance.at.height).toLocaleString()}`}
          link={`/blocks/${balance.at.height}`}
        />
        {isValidator && (
          <div className="flex items-start justify-between gap-4 py-1.5">
            <span className="shrink-0 text-sm text-muted-foreground">Role</span>
            <Badge variant="primary">Active Validator</Badge>
          </div>
        )}
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
  decimals,
  symbol,
}: {
  label: string;
  value: string;
  decimals: number;
  symbol: string;
}) {
  return (
    <div className="rounded-md border bg-muted/20 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-medium tabular-nums">
        {formatBalance(value, decimals)} <span className="text-xs text-muted-foreground">{symbol}</span>
      </p>
    </div>
  );
}
