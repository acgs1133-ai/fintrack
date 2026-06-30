export default function Skeleton({ className = "", variant = "line" }) {
  const variants = {
    line: "h-4 w-full rounded",
    title: "h-6 w-1/3 rounded",
    card: "h-24 w-full rounded-xl",
    circle: "h-10 w-10 rounded-full",
    avatar: "h-8 w-8 rounded-full",
  };

  return <div className={`animate-pulse bg-white/5 ${variants[variant] || variants.line} ${className}`} />;
}

export function SkeletonList({ rows = 4 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-bg-card p-3">
          <Skeleton variant="circle" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-2/3" />
            <Skeleton className="w-1/3" />
          </div>
          <Skeleton className="w-16" />
        </div>
      ))}
    </div>
  );
}
