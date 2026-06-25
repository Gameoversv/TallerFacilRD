import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
}

/** GarageFlow mark: a hex bay holding a bolt + motion slash. */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gf-mark" x1="6" y1="3" x2="34" y2="37">
          <stop offset="0" stopColor="#34b6ff" />
          <stop offset="1" stopColor="#0091e6" />
        </linearGradient>
      </defs>
      <path
        d="M20 2.5 33.4 10v15L20 32.5 6.6 25V10L20 2.5Z"
        fill="url(#gf-mark)"
        fillOpacity="0.14"
        stroke="url(#gf-mark)"
        strokeWidth="1.6"
      />
      {/* bolt / flow */}
      <path
        d="M22.5 11.5 14 21h5l-1.5 7.5L26 18.5h-5l1.5-7Z"
        fill="url(#gf-mark)"
      />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  collapsed?: boolean;
}

export function Logo({ className, collapsed = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-[1.05rem] font-bold tracking-tight text-white">
            Garage<span className="text-primary">Flow</span>
          </span>
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Taller OS · RD
          </span>
        </div>
      )}
    </div>
  );
}
