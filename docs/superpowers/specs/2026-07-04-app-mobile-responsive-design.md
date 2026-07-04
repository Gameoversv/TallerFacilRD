# Diseño: App móvil-friendly + elevación de landing

- **Fecha:** 2026-07-04
- **Rama:** `feat/rebrand-workshoptrack`
- **Área:** `apps/web` (Next.js)
- **Autor:** brainstorming session

## Contexto

El sistema de diseño ya es maduro (`src/app/globals.css`): dirección "industrial
premium / automotive-diagnostic dark", tokens semánticos, utilidades propias
(`surface-glass`, `glow-primary`, `grid-texture`, `animate-rise`, manejo de
formularios y print). La landing (`(marketing)`) ya se ve profesional y es
responsive. El dashboard (`(dashboard)`) comparte ese mismo sistema y ya tiene
navegación móvil (dropdown en `Topbar`).

El hueco real es el **contenido del dashboard en móvil**: las páginas de listado
usan `<Table>` que solo hace scroll horizontal (`overflow-auto`), lo cual es mala
UX táctil. También hay filas de encabezado que se aprietan en pantallas angostas.

## Objetivos

1. **Fase 1 (prioridad):** Hacer el dashboard usable en móvil (320–430px).
   - Tablas de datos → tarjetas apiladas en móvil, tabla en `md+`.
   - Encabezados de página que no se aprieten; botones full-width en móvil.
   - Formularios y diálogos verificados a 320/375px.
2. **Fase 2 (elevación, no rediseño):** Pulir la landing y añadir menú móvil.

## No-objetivos

- NO rediseñar el sistema de diseño ni la paleta (ya es fuerte).
- NO rediseñar la landing desde cero (solo elevación).
- NO tocar lógica de negocio, hooks de datos, ni API.
- NO cambiar la navegación del dashboard (el dropdown de `Topbar` ya funciona).

## Nota de implementación (IMPORTANTE)

`apps/web/AGENTS.md` advierte que esta es una versión modificada de Next.js con
breaking changes. **Antes de escribir código, leer la guía relevante en
`node_modules/next/dist/docs/`.** No asumir APIs/convenciones de memoria.

## Arquitectura — Fase 1

### Primitivo reutilizable: `ResponsiveList<T>`

Un solo componente que define columnas una vez y renderiza dos vistas. Evita
duplicar markup en las 9 páginas (DRY).

Ubicación: `src/components/layout/ResponsiveList.tsx`

```ts
interface ResponsiveColumn<T> {
  /** Encabezado de columna (desktop) y etiqueta de campo (card móvil). */
  header: string;
  /** Render del valor de la celda. */
  cell: (item: T) => React.ReactNode;
  /** Si es la columna "título" de la tarjeta móvil (nombre, placa, #factura). */
  primary?: boolean;
  /** Columna de acciones: se ancla al pie de la tarjeta en móvil. */
  isAction?: boolean;
  /** Ocultar esta fila etiqueta:valor dentro de la tarjeta móvil. */
  hideLabelOnCard?: boolean;
  /** Clases extra para el <th>/<td> desktop. */
  className?: string;
}

interface ResponsiveListProps<T> {
  items: T[];
  columns: ResponsiveColumn<T>[];
  getKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  /** Nº de filas skeleton mientras carga. Default 6. */
  loadingRows?: number;
}
```

**Comportamiento:**

- **Desktop (`md+`, `hidden md:block`):** renderiza el `<Table>` shadcn existente
  usando `columns`. Mantiene `onRowClick`, hover, columna de acciones.
- **Móvil (`md:hidden`):** lista de tarjetas (`rounded-lg border bg-card`), una
  por item:
  - La columna `primary` se muestra como título de la tarjeta.
  - Las demás columnas (excepto `isAction`) se muestran como filas
    `etiqueta : valor` (etiqueta = `header`), salvo `hideLabelOnCard`.
  - Las columnas `isAction` van en un pie de tarjeta.
  - Tarjeta clickeable si hay `onRowClick` (con `role="button"` + soporte teclado).
- **Loading:** skeletons (usa `Skeleton` existente) en ambas vistas.
- **Vacío:** `emptyMessage` centrado.

**Accesibilidad:** tarjeta clickeable = elemento con `role="button"`, `tabIndex=0`,
handler de `Enter`/`Space`; el botón de acción para propagación (`stopPropagation`).

### Migración de páginas (9 archivos)

Reemplazar el bloque `<Table>…</Table>` por `<ResponsiveList>` definiendo
`columns`. Sin cambios en hooks de datos, paginación ni diálogos.

- `(dashboard)/clientes/page.tsx`  ← página piloto
- `(dashboard)/vehiculos/page.tsx`
- `(dashboard)/facturas/page.tsx`
- `(dashboard)/inventario/page.tsx`
- `(dashboard)/ordenes/page.tsx`
- `(dashboard)/compras/page.tsx`
- `(dashboard)/cuentas-cobrar/page.tsx`
- `(dashboard)/ordenes/[id]/page.tsx`  (tabla de líneas; evaluar si card aplica)
- `(dashboard)/compras/[id]/page.tsx`  (tabla de líneas; evaluar si card aplica)

> Las tablas de "líneas de detalle" (`ordenes/[id]`, `compras/[id]`) puede que
> queden mejor con scroll horizontal contenido que con cards. Decidir por página
> durante la implementación; el primitivo soporta ambos (si una página no migra,
> se envuelve la tabla en un contenedor `overflow-x-auto` sin romper el layout).

### Fix de encabezados de página

Patrón actual repetido:
```tsx
<div className="flex items-center justify-between">
  <div>…título…</div>
  <Button>+ Nuevo</Button>
</div>
```
Cambiar a apilar en móvil y alinear en `sm+`:
```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  …
  <Button className="w-full sm:w-auto">+ Nuevo</Button>
</div>
```
Aplicar donde exista este patrón (idealmente vía el componente `PageHeader`
existente si aplica — revisar `src/components/layout/PageHeader.tsx`).

### Audit de formularios/diálogos

Revisar a 320/375px: `CustomerForm`, `VehicleForm`, `ProductForm`,
`ReceptionWizard`, `ReminderForm`, y `DialogContent`. Ajustar grids de campos a
1 columna en móvil (`grid-cols-1 sm:grid-cols-2`) y anchos de diálogo
(`max-w-` con `w-[calc(100%-2rem)]`). Solo ajustes responsive, sin cambiar lógica.

## Arquitectura — Fase 2 (elevación landing)

1. **Menú móvil en `MarketingHeader`:** los anchor links (`#funciones`, `#precio`,
   `#preguntas`) hoy son `hidden md:flex` y desaparecen en móvil. Añadir botón
   hamburguesa + panel/sheet accesible (usar el `DropdownMenu` existente o un
   sheet simple), con foco atrapado y cierre por `Esc`.
2. **Pulido dirigido:** ritmo tipográfico, espaciado de secciones, estados
   hover/focus, profundidad. Mantener la dirección visual actual. Sin rediseño.

## Testing

- **Responsive manual/visual:** 320, 375, 768, 1024, 1440 en las 9 páginas de
  listado + landing. Sin overflow horizontal del body.
- **Accesibilidad:** navegación por teclado en tarjetas clickeables y menú móvil;
  `Esc` cierra menú; foco visible.
- **Regresión:** verificar que `onRowClick`, paginación, búsqueda y diálogos de
  crear/editar siguen funcionando en desktop.
- Preferir Playwright screenshots por breakpoint (regla web/testing).

## Riesgos

- **Next.js modificado:** APIs distintas a lo esperado → leer docs locales primero.
- **9 páginas:** riesgo de deriva/copiar-pegar → mitigado por el primitivo único.
- **Tablas de detalle** (`[id]`): las cards pueden no encajar → decisión por página.
- **Presupuesto de contexto:** migrar 9 páginas + audit puede ser largo →
  hacer piloto (clientes) primero, checkpoint, luego el resto en lotes.

## Orden de trabajo (resumen)

1. Leer `node_modules/next/dist/docs/` relevante.
2. Construir `ResponsiveList` + migrar `clientes` (piloto). Checkpoint visual.
3. Migrar las 8 páginas restantes.
4. Fix de encabezados de página.
5. Audit de formularios/diálogos.
6. (Fase 2) Menú móvil landing + pulido dirigido.
