"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Car, CornerDownLeft, Loader2, Search, Users } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import type { CustomersPage } from "@/types/customer";
import type { VehiclesPage } from "@/types/vehicle";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;
const MAX_PER_GROUP = 5;

type Result =
  | { kind: "customer"; id: string; title: string; subtitle: string }
  | { kind: "vehicle"; id: string; title: string; subtitle: string };

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debounced = useDebounced(query.trim(), DEBOUNCE_MS);
  const enabled = open && debounced.length >= MIN_CHARS;

  const customersQ = useQuery<CustomersPage>({
    queryKey: ["search", "customers", debounced],
    queryFn: async () => {
      const res = await api.get("/api/customers", {
        params: { q: debounced, page: 0, size: MAX_PER_GROUP },
      });
      return res.data;
    },
    enabled,
  });

  const vehiclesQ = useQuery<VehiclesPage>({
    queryKey: ["search", "vehicles", debounced],
    queryFn: async () => {
      const res = await api.get("/api/vehicles", {
        params: { q: debounced, page: 0, size: MAX_PER_GROUP },
      });
      return res.data;
    },
    enabled,
  });

  const results = useMemo<Result[]>(() => {
    const customers = (customersQ.data?.data ?? [])
      .slice(0, MAX_PER_GROUP)
      .map<Result>((c) => ({
        kind: "customer",
        id: c.id,
        title: c.full_name,
        subtitle: c.document_id ?? c.phone ?? "Cliente",
      }));
    const vehicles = (vehiclesQ.data?.data ?? [])
      .slice(0, MAX_PER_GROUP)
      .map<Result>((v) => ({
        kind: "vehicle",
        id: v.id,
        title: `${v.brand} ${v.model}${v.year ? ` · ${v.year}` : ""}`,
        subtitle: v.license_plate ?? v.customer_name ?? "Vehículo",
      }));
    return [...customers, ...vehicles];
  }, [customersQ.data, vehiclesQ.data]);

  const loading = enabled && (customersQ.isFetching || vehiclesQ.isFetching);

  // Cmd/Ctrl+K to focus
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside closes
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(r: Result) {
    setOpen(false);
    setQuery("");
    router.push(r.kind === "customer" ? `/clientes/${r.id}` : `/vehiculos/${r.id}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active];
      if (r) go(r);
    }
  }

  const showPanel = open && debounced.length >= MIN_CHARS;

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Buscar cliente, placa, vehículo…"
          className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-12 text-sm text-white placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <kbd className="pointer-events-none absolute right-2.5 hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[0.6rem] font-medium text-muted-foreground lg:block">
          ⌘K
        </kbd>
      </div>

      {showPanel && (
        <div className="absolute right-0 z-50 mt-2 w-[min(28rem,90vw)] overflow-hidden rounded-xl border border-border bg-popover shadow-2xl shadow-black/50">
          {loading && results.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando…
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Sin resultados para{" "}
              <span className="font-medium text-white">“{debounced}”</span>
            </div>
          ) : (
            <ul className="max-h-[22rem] overflow-y-auto p-1.5">
              {results.map((r, i) => {
                const Icon = r.kind === "customer" ? Users : Car;
                const isActive = i === active;
                return (
                  <li key={`${r.kind}-${r.id}`}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(r)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        isActive ? "bg-primary/12" : "hover:bg-muted/50",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          r.kind === "customer"
                            ? "bg-primary/12 text-primary"
                            : "bg-success/12 text-success",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {r.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {r.kind === "vehicle" && r.subtitle ? (
                            <span className="nums">{r.subtitle}</span>
                          ) : (
                            r.subtitle
                          )}
                        </p>
                      </div>
                      <span className="text-[0.6rem] font-medium uppercase tracking-wide text-muted-foreground">
                        {r.kind === "customer" ? "Cliente" : "Vehículo"}
                      </span>
                      {isActive && (
                        <CornerDownLeft className="h-3.5 w-3.5 text-primary" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
