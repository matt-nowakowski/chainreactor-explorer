import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <span className="text-2xl font-bold text-muted-foreground">404</span>
      </div>
      <div>
        <h1 className="text-lg font-semibold">Page not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
