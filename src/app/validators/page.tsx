import Link from "next/link";
import { getAuthorities, getRuntimeSpec } from "@/lib/sidecar";
import { truncateAddress } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ValidatorsPage() {
  let validators: string[] = [];
  let specName: string | null = null;
  let atHeight: string | null = null;

  try {
    const [authResult, spec] = await Promise.all([
      getAuthorities(),
      getRuntimeSpec().catch(() => null),
    ]);
    validators = Array.isArray(authResult.value) ? (authResult.value as string[]) : [];
    atHeight = authResult.at?.height || null;
    specName = spec?.specName || null;
  } catch {
    // Will render empty state
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Validators</h1>
        <p className="text-xs text-muted-foreground">
          Current Aura authority set
          {atHeight && ` at block #${Number(atHeight).toLocaleString()}`}
        </p>
      </div>

      {/* Summary card */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Active Validators</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{validators.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Consensus</p>
          <p className="mt-1 text-sm font-medium">Aura (Round Robin)</p>
        </div>
        {specName && (
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Runtime</p>
            <p className="mt-1 text-sm font-medium font-mono">{specName}</p>
          </div>
        )}
      </div>

      {/* Validator table */}
      {validators.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-medium w-16">Index</th>
                <th className="px-4 py-2.5 text-left font-medium">Address</th>
              </tr>
            </thead>
            <tbody>
              {validators.map((addr, i) => (
                <tr key={addr} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="text-xs text-muted-foreground font-mono">{i}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/accounts/${addr}`}
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      <span className="hidden sm:inline">{addr}</span>
                      <span className="sm:hidden">{truncateAddress(addr, 8)}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border px-4 py-8 text-center text-xs text-muted-foreground">
          Unable to fetch validators. The Aura pallet may not be available.
        </div>
      )}

      <p className="text-[10px] text-muted-foreground">
        Aura authorities rotate per session. Session changes take effect at the next rotation boundary.
      </p>
    </div>
  );
}
