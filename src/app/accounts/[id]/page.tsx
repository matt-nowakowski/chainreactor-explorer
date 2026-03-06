import { notFound } from "next/navigation";
import Link from "next/link";
import { getAccountBalance, getRuntimeSpec, getAuthorities } from "@/lib/sidecar";
import { isIndexerConfigured, getAccountExtrinsics, getAccountTransfers } from "@/lib/indexer";
import { formatBalance, truncateHash, truncateAddress, formatMethod } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { DetailRow } from "@/components/detail-row";
import { Badge } from "@/components/badge";
import { Timestamp } from "@/components/timestamp";

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

      {/* Transaction History */}
      {isIndexerConfigured() ? (
        <AccountHistory address={id} tokenDecimals={tokenDecimals} tokenSymbol={tokenSymbol} />
      ) : (
        <div className="rounded-lg border border-dashed p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Transaction history requires an indexer and is not available in the current explorer version.
          </p>
        </div>
      )}
    </div>
  );
}

async function AccountHistory({
  address,
  tokenDecimals,
  tokenSymbol,
}: {
  address: string;
  tokenDecimals: number;
  tokenSymbol: string;
}) {
  const [extResult, txResult] = await Promise.all([
    getAccountExtrinsics(address, 10, 1).catch(() => null),
    getAccountTransfers(address, 10, 1).catch(() => null),
  ]);

  return (
    <div className="space-y-6">
      {/* Extrinsics */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">
            Extrinsics
            {extResult && (
              <span className="ml-2 text-xs text-muted-foreground">({extResult.total.toLocaleString()} total)</span>
            )}
          </h2>
        </div>
        {extResult && extResult.extrinsics.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-medium">ID</th>
                  <th className="px-4 py-2.5 text-left font-medium">Method</th>
                  <th className="px-4 py-2.5 text-center font-medium">Result</th>
                  <th className="px-4 py-2.5 text-right font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {extResult.extrinsics.map((ext) => (
                  <tr key={`${ext.block_number}-${ext.extrinsic_index}`} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <Link href={`/extrinsics/${ext.block_number}-${ext.extrinsic_index}`} className="font-mono text-sm text-primary hover:underline font-medium">
                        {ext.block_number}-{ext.extrinsic_index}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant="neutral" mono>
                        {formatMethod(ext.pallet, ext.method)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge variant={ext.success ? "success" : "error"}>
                        {ext.success ? "Success" : "Failed"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Timestamp ms={ext.timestamp} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No extrinsics found</p>
        )}
      </div>

      {/* Transfers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">
            Transfers
            {txResult && (
              <span className="ml-2 text-xs text-muted-foreground">({txResult.total.toLocaleString()} total)</span>
            )}
          </h2>
        </div>
        {txResult && txResult.transfers.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-medium">Block</th>
                  <th className="px-4 py-2.5 text-left font-medium">From</th>
                  <th className="px-4 py-2.5 text-left font-medium">To</th>
                  <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {txResult.transfers.map((tx, i) => (
                  <tr key={`${tx.block_number}-${tx.extrinsic_index}-${i}`} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <Link href={`/blocks/${tx.block_number}`} className="font-mono text-sm text-primary hover:underline">
                        {tx.block_number.toLocaleString()}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link href={`/accounts/${tx.from_address}`} className={`font-mono text-sm ${tx.from_address === address ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                        {truncateAddress(tx.from_address, 6)}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link href={`/accounts/${tx.to_address}`} className={`font-mono text-sm ${tx.to_address === address ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                        {truncateAddress(tx.to_address, 6)}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-sm font-medium">
                        {formatBalance(tx.amount, tokenDecimals)}{" "}
                        <span className="text-muted-foreground font-normal">{tokenSymbol}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No transfers found</p>
        )}
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
