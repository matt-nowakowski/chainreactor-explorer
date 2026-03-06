const variants = {
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  error: "bg-red-500/10 text-red-600 dark:text-red-400",
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
} as const;

export function Badge({
  variant = "neutral",
  children,
  mono,
}: {
  variant?: keyof typeof variants;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${variants[variant]} ${mono ? "font-mono" : ""}`}
    >
      {children}
    </span>
  );
}
