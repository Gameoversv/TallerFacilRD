# App Mobile-Friendly Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the WorkshopTrack dashboard usable on phones (320–430px) by rendering data tables as stacked cards on mobile, fixing cramped page headers, and auditing forms — then elevate the landing with a mobile menu.

**Architecture:** One reusable generic primitive `ResponsiveList<T>` defines columns once and renders the existing shadcn `<Table>` on `md+` and stacked cards on mobile. The 7 list pages migrate to it. Line-item detail tables get a horizontal-scroll wrapper instead. No changes to data hooks, API, or business logic.

**Tech Stack:** Next.js 16.2.9 (⚠️ modified — see Global Constraints), React 19.2.4, Tailwind CSS v4, shadcn/ui, lucide-react, `cn` from `@/lib/utils`.

## Global Constraints

- ⚠️ **Modified Next.js.** `apps/web/AGENTS.md` warns APIs/conventions differ from training data. Before writing code that touches Next APIs (routing, `Link`, metadata), read the relevant guide in `apps/web/node_modules/next/dist/docs/`.
- **No unit-test runner exists** (scripts: `dev`, `build`, `lint` only). Do NOT install jest/vitest/playwright — out of scope. Verification gate for every task: `npm run lint` clean on touched files + `npm run build` succeeds + manual visual check at 375px width.
- **Design system is fixed.** Reuse existing tokens/utilities (`bg-card`, `border-border`, `text-muted-foreground`, `Skeleton`, `rounded-lg`). Do NOT add colors or restyle the design language.
- **Immutability / TS style:** typed props via `interface`, no `any`, no `console.log`.
- All commits on branch `feat/rebrand-workshoptrack`. Commit message type: `feat` / `refactor`.
- Working dir for all commands: `apps/web`.

---

## File Structure

- **Create:** `apps/web/src/components/layout/ResponsiveList.tsx` — the generic primitive (table on `md+`, cards on mobile). Single responsibility: responsive rendering of a row collection.
- **Modify (migrate to primitive):** 7 list pages under `apps/web/src/app/(dashboard)/`:
  `clientes`, `inventario`, `vehiculos`, `ordenes`, `compras`, `facturas`, `cuentas-cobrar` (`/page.tsx` each).
- **Modify (scroll wrap only):** `ordenes/[id]/page.tsx`, `compras/[id]/page.tsx` — line-item tables.
- **Modify (header fix):** any list page still using raw `flex items-center justify-between` for its title row → adopt existing `PageHeader` (`apps/web/src/components/layout/PageHeader.tsx`, already responsive).
- **Modify (Phase 2):** `apps/web/src/components/marketing/header.tsx` — add mobile menu.

---

## The mechanical migration rule (referenced by Tasks 4–9)

Each list page currently has this shape:

```tsx
<div className="rounded-md border bg-card">
  <Table>
    <TableHeader><TableRow>
      <TableHead>HeaderA</TableHead> … <TableHead className="w-24"></TableHead>
    </TableRow></TableHeader>
    <TableBody>
      {items.map((it) => (
        <TableRow key={…} onClick={…}>
          <TableCell>{/* cellA JSX */}</TableCell>
          …
          <TableCell>{/* actions JSX */}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

Transform: **delete that block**, replace with `<ResponsiveList>`. For each old
column build one `ResponsiveColumn`:
- `header` = the old `<TableHead>` text (empty for the actions column).
- `cell: (it) => (…)` = **lift verbatim the JSX that was inside the matching
  `<TableCell>`**, replacing the row variable (`c`, `v`, `o`…) with the `cell`
  param.
- Copy `text-right` / width classes from the old `<TableHead>` into the column
  `className`.
- Mark the name/number identity column `primary: true`.
- Mark the actions column `isAction: true` (its `header` is `""`).
- Move `key`, `onClick` (row navigation) into `getKey` / `onRowClick`.
- Keep the loading (`isLoading`) and empty states via the primitive's props;
  delete the old `isLoading ? … :` wrapper and the empty `<TableRow>`.

Do not change field names, formatting helpers, mutations, pagination, or dialogs.

---

## Task 1: ResponsiveList primitive

**Files:**
- Create: `apps/web/src/components/layout/ResponsiveList.tsx`

**Interfaces:**
- Produces:
  ```ts
  interface ResponsiveColumn<T> {
    header: string;
    cell: (item: T) => React.ReactNode;
    primary?: boolean;
    isAction?: boolean;
    hideLabelOnCard?: boolean;
    className?: string;
  }
  interface ResponsiveListProps<T> {
    items: T[];
    columns: ResponsiveColumn<T>[];
    getKey: (item: T) => string;
    onRowClick?: (item: T) => void;
    isLoading?: boolean;
    emptyMessage?: string;
    loadingRows?: number;
  }
  export function ResponsiveList<T>(props: ResponsiveListProps<T>): React.ReactElement;
  ```

- [ ] **Step 1: Write the component**

Create `apps/web/src/components/layout/ResponsiveList.tsx`:

```tsx
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
```

- [ ] **Step 2: Typecheck / lint**

Run (in `apps/web`): `npm run lint`
Expected: no errors for `ResponsiveList.tsx`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/layout/ResponsiveList.tsx
git commit -m "feat: add ResponsiveList primitive (table on md+, cards on mobile)"
```

---

## Task 2: Migrate `clientes` (pilot)

**Files:**
- Modify: `apps/web/src/app/(dashboard)/clientes/page.tsx`

**Interfaces:**
- Consumes: `ResponsiveList`, `ResponsiveColumn` from Task 1.

- [ ] **Step 1: Replace the table block**

In `clientes/page.tsx`: remove the `Table`/`TableHeader`/`TableBody`/`TableRow`/
`TableHead`/`TableCell` imports and the entire `{isLoading ? … : (<div className="rounded-md border bg-card"><Table>…</Table></div>)}` block. Add
`import { ResponsiveList, type ResponsiveColumn } from "@/components/layout/ResponsiveList";`.

Define columns (customer type field names: `full_name`, `document_id`, `phone`, `email`, `id`):

```tsx
const columns: ResponsiveColumn<(typeof customers)[number]>[] = [
  { header: "Nombre", primary: true, cell: (c) => c.full_name },
  { header: "Cédula / RNC", cell: (c) => c.document_id ?? "—" },
  { header: "Teléfono", cell: (c) => c.phone ?? "—" },
  { header: "Correo", cell: (c) => c.email ?? "—" },
  {
    header: "",
    isAction: true,
    className: "w-24",
    cell: (c) => (
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          if (confirm(`¿Eliminar a ${c.full_name}?`)) {
            deleteMutation.mutate(c.id);
          }
        }}
      >
        Eliminar
      </Button>
    ),
  },
];
```

Render (replacing the removed block):

```tsx
<ResponsiveList
  items={customers}
  columns={columns}
  getKey={(c) => c.id}
  onRowClick={(c) => router.push(`/clientes/${c.id}`)}
  isLoading={isLoading}
  emptyMessage="Sin resultados"
/>
```

- [ ] **Step 2: Fix the header row**

Replace the top `<div className="flex items-center justify-between">…</div>` with `PageHeader`:

```tsx
import { PageHeader } from "@/components/layout/PageHeader";
…
<PageHeader
  title="Clientes"
  description={`${total} registros`}
  actions={
    <Button onClick={() => setShowCreate(true)} className="w-full sm:w-auto">
      + Nuevo cliente
    </Button>
  }
/>
```

- [ ] **Step 3: Lint + build**

Run (in `apps/web`): `npm run lint` then `npm run build`
Expected: both succeed.

- [ ] **Step 4: Visual check**

Run `npm run dev`, open `/clientes`, use the /run skill or browser devtools at 375px.
Verify: desktop shows the table; at 375px each customer is a card with name as
title, label:value rows, a delete button in the footer, and tapping the card
navigates. No horizontal body scroll.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/\(dashboard\)/clientes/page.tsx
git commit -m "refactor: clientes list uses ResponsiveList (mobile cards)"
```

---

## Tasks 3–8: Migrate remaining list pages

For each task below: apply **The mechanical migration rule**, then run
`npm run lint` + `npm run build` + visual check at 375px, then commit with
message `refactor: <page> list uses ResponsiveList (mobile cards)`. Each page is
independently testable and gets its own commit.

### Task 3: `inventario/page.tsx`
Columns → `Código` (primary), `Descripción`, `Categoría`, `Stock`
(`className:"text-right"`), `Precio venta` (`className:"text-right"`), actions
(`className:"w-32"`). Lift existing cell JSX per the rule.

### Task 4: `vehiculos/page.tsx`
Columns → `Vehículo` (primary), `Año`, `Placa`, `Propietario`, `Transmisión`,
actions (`className:"w-24"`). Row navigation via existing `onClick`.

### Task 5: `facturas/page.tsx`
Columns → `N° Factura` (primary), `Cliente`, `Vehículo`, `Fecha`, `Estado`
(status badge), `Total` (`className:"text-right"`), actions (`className:"w-20"`).

### Task 6: `cuentas-cobrar/page.tsx`
Columns → `N° Factura` (primary), `Cliente`, `Vehículo`, `Fecha`, `Total`
(`text-right`), `Pagado` (`text-right`), `Pendiente` (`text-right`), actions
(`className:"w-20"`).

### Task 7: `ordenes/page.tsx`
Columns → `Vehículo` (primary), `Cliente`, `Técnico`, `Estado` (status badge),
`Costo est.` (`text-right`), `Fecha`. No actions column (there is none in this
table — omit `isAction`). Preserve row navigation.

### Task 8: `compras/page.tsx`
Columns → `Fecha` (primary), `Proveedor`, `Ítems` (`text-right`), `Total`
(`text-right`), actions (`className:"w-24"`).

> After each: if the page still uses a raw `flex items-center justify-between`
> title row, swap to `PageHeader` with `actions={<Button className="w-full sm:w-auto">…}` per Task 2 Step 2.

---

## Task 9: Line-item detail tables → horizontal scroll

**Files:**
- Modify: `apps/web/src/app/(dashboard)/ordenes/[id]/page.tsx` (table at ~line 293)
- Modify: `apps/web/src/app/(dashboard)/compras/[id]/page.tsx` (table at ~line 41)

Line-item tables (5–6 numeric columns) read poorly as cards. Keep the table,
guarantee contained horizontal scroll so it never pushes the page wide.

- [ ] **Step 1:** Wrap each `<Table>…</Table>` in `<div className="w-full overflow-x-auto">…</div>` (the shadcn `Table` already has an inner `overflow-auto`, but ensure the *outer* container is `max-w-full` so the page body never scrolls). Verify the parent card uses `overflow-hidden` on its rounded border if clipping is desired.
- [ ] **Step 2:** `npm run lint` + `npm run build`.
- [ ] **Step 3:** Visual check `/ordenes/<id>` and `/compras/<id>` at 375px — table scrolls inside its container, page body does not scroll horizontally.
- [ ] **Step 4:** Commit `refactor: contain detail line-item tables on mobile`.

---

## Task 10: Form & dialog mobile audit

**Files (inspect, modify only if they overflow at 375px):**
- `apps/web/src/components/customers/CustomerForm.tsx`
- `apps/web/src/components/vehicles/VehicleForm.tsx`
- `apps/web/src/components/inventory/ProductForm.tsx`
- `apps/web/src/components/receptions/ReceptionWizard.tsx`
- `apps/web/src/app/(dashboard)/recordatorios/_components/ReminderForm.tsx`
- `apps/web/src/components/ui/dialog.tsx` (DialogContent width)

- [ ] **Step 1:** For each form, find multi-column field grids (`grid-cols-2`, `sm:grid-cols-2`, flex rows of inputs). Ensure they collapse to one column on mobile: `grid grid-cols-1 sm:grid-cols-2`.
- [ ] **Step 2:** In `dialog.tsx`, ensure `DialogContent` has a mobile-safe width: it should include `w-[calc(100%-2rem)]` (or `max-w-[calc(100vw-2rem)]`) alongside its `max-w-lg` so dialogs never exceed the viewport at 320px. Only change the className string; do not alter Radix wiring.
- [ ] **Step 3:** `npm run lint` + `npm run build`.
- [ ] **Step 4:** Visual check: open each create/edit dialog at 375px — no field or dialog exceeds the viewport; inputs are tappable full-width.
- [ ] **Step 5:** Commit `fix: forms and dialogs fit mobile viewports`.

---

## Task 11 (Phase 2): Landing mobile menu

**Files:**
- Modify: `apps/web/src/components/marketing/header.tsx`

The anchor nav is `hidden … md:flex` and vanishes on mobile. Add a hamburger +
menu using the already-installed `DropdownMenu` (Radix) for accessibility
(focus trap + `Esc` handled by Radix).

- [ ] **Step 1:** Import `DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger` from `@/components/ui/dropdown-menu` and `Menu` from `lucide-react`.
- [ ] **Step 2:** Add, visible only `< md` (`md:hidden`), before the login/CTA group:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger
    aria-label="Abrir menú"
    className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground md:hidden"
  >
    <Menu className="h-5 w-5" />
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-48">
    {ANCHOR_LINKS.map((link) => (
      <DropdownMenuItem key={link.href} asChild>
        <a href={link.href}>{link.label}</a>
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

- [ ] **Step 3:** `npm run lint` + `npm run build`.
- [ ] **Step 4:** Visual check at 375px: hamburger appears, opens the 3 anchor links, they scroll to sections, `Esc` closes it. Desktop unchanged.
- [ ] **Step 5:** Commit `feat: mobile menu on marketing header`.

---

## Task 12 (Phase 2): Landing polish pass

**Files:** marketing components under `apps/web/src/components/marketing/` (as needed).

- [ ] **Step 1:** Review each section at 320/375/768/1440. Look for: uneven section vertical rhythm, links/buttons lacking `hover`/`focus-visible` states, headings without `text-balance`, tap targets < 44px on mobile.
- [ ] **Step 2:** Apply only additive, low-risk polish using existing tokens/utilities (`focus-visible:ring-2 focus-visible:ring-ring`, consistent `py-` section spacing, `hover:` transitions). Do not change layout structure or the visual direction.
- [ ] **Step 3:** `npm run lint` + `npm run build`.
- [ ] **Step 4:** Visual check across breakpoints; no regressions.
- [ ] **Step 5:** Commit `style: landing polish (spacing, focus states, tap targets)`.

---

## Self-Review

- **Spec coverage:** ResponsiveList (spec §Arquitectura) → Task 1. 7 list-page
  migrations (spec list) → Tasks 2, 3–8. Detail tables scroll decision → Task 9.
  Header fix → Task 2 Step 2 + note on Tasks 3–8. Form/dialog audit → Task 10.
  Phase 2 mobile menu → Task 11. Phase 2 polish → Task 12. Next-docs + no-test-
  runner constraints → Global Constraints. All spec sections covered.
- **Placeholder scan:** the per-page Tasks 3–8 intentionally reference the shared
  "mechanical migration rule" (defined in full above with before/after code) plus
  Task 2's worked example — the transform is explicit, not vague. No "TBD"/"handle
  edge cases"/"add validation" left.
- **Type consistency:** `ResponsiveColumn<T>` / `ResponsiveListProps<T>` field
  names (`header`, `cell`, `primary`, `isAction`, `hideLabelOnCard`, `className`,
  `items`, `columns`, `getKey`, `onRowClick`, `isLoading`, `emptyMessage`,
  `loadingRows`) are identical in Task 1 definition and all consumer tasks.
```
