import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Optional eyebrow label above the title (e.g. section / module). */
  eyebrow?: string;
  /** Right-aligned actions (buttons, filters). */
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1.5">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary/80">
            <span className="h-1 w-1 rounded-full bg-primary" />
            {eyebrow}
          </span>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-[1.75rem]">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
