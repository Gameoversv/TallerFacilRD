import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Trend = "up" | "down" | "flat";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  /** e.g. "+12%" — rendered as a delta chip. */
  delta?: string;
  trend?: Trend;
  /** Secondary helper line under the value. */
  hint?: string;
  /** Accent tint for the icon chip. */
  accent?: "primary" | "success" | "warning" | "danger";
  className?: string;
}

const accentMap: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary/12 text-primary",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  danger: "bg-destructive/12 text-destructive",
};

const trendMap: Record<Trend, string> = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  trend = "flat",
  hint,
  accent = "primary",
  className,
}: StatCardProps) {
  const TrendIcon = trend === "down" ? ArrowDownRight : ArrowUpRight;
  return (
    <div
      className={cn(
        "edge-top relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            accentMap[accent],
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <div className="mt-3 flex items-end gap-2.5">
        <span className="nums text-[1.8rem] font-semibold leading-none text-white">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              "mb-0.5 inline-flex items-center gap-0.5 text-xs font-semibold",
              trendMap[trend],
            )}
          >
            {trend !== "flat" && <TrendIcon className="h-3.5 w-3.5" />}
            {delta}
          </span>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
