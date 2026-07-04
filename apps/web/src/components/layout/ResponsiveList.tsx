"use client";

import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ResponsiveColumn<T> {
  /** Column header (desktop) and field label (mobile card). */
  header: string;
  /** Renders the cell value. */
  cell: (item: T) => React.ReactNode;
  /** The identity column: shown as the card title on mobile. */
  primary?: boolean;
  /** Actions column: anchored to the card footer on mobile; no label. */
  isAction?: boolean;
  /** Hide the "label : value" line for this column inside the mobile card. */
  hideLabelOnCard?: boolean;
  /** Extra classes for the desktop <th>/<td> (e.g. "text-right", "w-24"). */
  className?: string;
}

export interface ResponsiveListProps<T> {
  items: T[];
  columns: ResponsiveColumn<T>[];
  getKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  loadingRows?: number;
}

export function ResponsiveList<T>({
  items,
  columns,
  getKey,
  onRowClick,
  isLoading = false,
  emptyMessage = "Sin resultados",
  loadingRows = 6,
}: ResponsiveListProps<T>) {
  const clickable = Boolean(onRowClick);

  if (isLoading) {
    return (
      <>
        {/* Desktop skeleton */}
        <div className="hidden rounded-md border bg-card md:block">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col, i) => (
                  <TableHead key={i} className={col.className}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: loadingRows }).map((_, r) => (
                <TableRow key={r}>
                  {columns.map((_, c) => (
                    <TableCell key={c}>
                      <Skeleton className="h-4 w-full max-w-[140px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Mobile skeleton */}
        <div className="space-y-3 md:hidden">
          {Array.from({ length: loadingRows }).map((_, r) => (
            <div key={r} className="rounded-lg border bg-card p-4">
              <Skeleton className="mb-3 h-5 w-2/3" />
              <Skeleton className="mb-2 h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border bg-card py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const primary = columns.find((c) => c.primary);
  const actions = columns.filter((c) => c.isAction);
  const details = columns.filter((c) => !c.primary && !c.isAction);

  function handleKey(e: React.KeyboardEvent, item: T) {
    if (!onRowClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRowClick(item);
    }
  }

  return (
    <>
      {/* Desktop: table */}
      <div className="hidden rounded-md border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={getKey(item)}
                className={cn(clickable && "cursor-pointer hover:bg-muted/40")}
                onClick={clickable ? () => onRowClick!(item) : undefined}
              >
                {columns.map((col, i) => (
                  <TableCell key={i} className={col.className}>
                    {col.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <div
            key={getKey(item)}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={clickable ? () => onRowClick!(item) : undefined}
            onKeyDown={clickable ? (e) => handleKey(e, item) : undefined}
            className={cn(
              "rounded-lg border bg-card p-4",
              clickable &&
                "cursor-pointer transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            {primary && (
              <div className="mb-2 font-medium text-white">
                {primary.cell(item)}
              </div>
            )}
            <dl className="space-y-1.5">
              {details.map((col, i) => (
                <div
                  key={i}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  {!col.hideLabelOnCard && (
                    <dt className="shrink-0 text-muted-foreground">
                      {col.header}
                    </dt>
                  )}
                  <dd
                    className={cn(
                      "min-w-0 text-right text-foreground",
                      col.hideLabelOnCard && "w-full",
                    )}
                  >
                    {col.cell(item)}
                  </dd>
                </div>
              ))}
            </dl>
            {actions.length > 0 && (
              <div
                className="mt-3 flex items-center justify-end gap-2 border-t border-border pt-3"
                onClick={(e) => e.stopPropagation()}
              >
                {actions.map((col, i) => (
                  <React.Fragment key={i}>{col.cell(item)}</React.Fragment>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
