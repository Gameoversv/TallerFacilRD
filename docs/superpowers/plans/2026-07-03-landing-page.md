# Landing Page de Ventas (GarageFlow) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Página pública de ventas en `/` de `apps/web` que convierte el guion de `VENTAS-BRIEF.md` en un vendedor 24/7, con CTA a prueba gratis (`/register`) y WhatsApp.

**Architecture:** Route group `(marketing)` en el App Router de Next.js 16 con layout propio (header/footer de marketing). Server components puros, cero JS de cliente (menú móvil y FAQ con `<details>`). Secciones como componentes en `src/components/marketing/`, textos y enlaces centralizados en `constants.ts`.

**Tech Stack:** Next.js 16.2.9 · React 19 · TypeScript · Tailwind CSS v4 (tokens `--gf-*` de `globals.css`) · `lucide-react` para iconos · `src/components/brand/Logo.tsx` existente.

## Global Constraints

- **Leer antes de codear:** `apps/web/AGENTS.md` exige leer los docs de `apps/web/node_modules/next/dist/docs/` (mínimo `01-app/01-getting-started/02-project-structure.md` y `03-layouts-and-pages.md`). Next 16 ≠ conocimiento de entrenamiento.
- Marca visible: **GarageFlow** (nunca "TallerFacilRD" en la UI).
- Idioma: español dominicano neutro, trato de "usted".
- Precio único: **RD$2,500/mes**, todo incluido, 15 días gratis sin tarjeta.
- WhatsApp: `18296321220`.
- **Cero client components** en la landing (`"use client"` prohibido en `src/components/marketing/` y `(marketing)/`).
- Solo tokens del design system existente (`bg-background`, `text-muted-foreground`, `--gf-primary` azul para CTAs, `--gf-warning` ámbar para acentos de dinero). Dark-only.
- Fuentes ya cargadas en root layout: `font-display` (Space Grotesk) para titulares, Inter texto, `font-mono` (JetBrains Mono) para cifras.
- Motion: solo `transform`/`opacity`; sin librerías de animación.
- Working dir de todos los comandos: `apps/web`. Verificación por tarea: `npm run build` verde.
- Commits: Conventional Commits, branch `feat/landing-page` (ya existe).
- La dirección visual fina (spacing, jerarquía, composición) es responsabilidad del implementador siguiendo la skill `frontend-design:frontend-design` y la sección "Dirección visual" del spec. El copy de este plan es **exacto**; la composición visual, no.

---

### Task 1: Constantes + swap de ruta raíz + shell de la landing

**Files:**
- Create: `apps/web/src/components/marketing/constants.ts`
- Create: `apps/web/src/app/(marketing)/layout.tsx`
- Create: `apps/web/src/app/(marketing)/page.tsx`
- Delete: `apps/web/src/app/page.tsx` (redirect a `/dashboard`)

**Interfaces:**
- Produces: `MARKETING` (objeto const con precio, links y WhatsApp) consumido por todas las secciones. `MarketingLayout` y `LandingPage` (default exports de Next).

- [ ] **Step 1: Leer docs Next 16** — `01-app/01-getting-started/02-project-structure.md` (route groups) y `03-layouts-and-pages.md` en `node_modules/next/dist/docs/`. Confirmar que `(marketing)/page.tsx` sirve `/` y que no puede coexistir con `src/app/page.tsx`.

- [ ] **Step 2: Crear `constants.ts`**

```ts
// apps/web/src/components/marketing/constants.ts
const WHATSAPP_NUMBER = "18296321220";
const WHATSAPP_TEXT = "Hola, quiero información de GarageFlow para mi taller.";

export const MARKETING = {
  brandName: "GarageFlow",
  priceMonthly: "RD$2,500",
  pricePerDay: "RD$85",
  trialDays: 15,
  registerHref: "/register",
  loginHref: "/login",
  portalHref: "/portal",
  whatsappHref: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEXT)}`,
  whatsappDisplay: "829-632-1220",
  ctaPrimaryLabel: "Prueba gratis 15 días",
  ctaSecondaryLabel: "Escríbanos por WhatsApp",
} as const;
```

- [ ] **Step 3: Crear layout de marketing (mínimo por ahora)**

```tsx
// apps/web/src/app/(marketing)/layout.tsx
export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="flex min-h-svh flex-col bg-background">{children}</div>;
}
```

- [ ] **Step 4: Crear página con metadata y `<main>` vacío**

```tsx
// apps/web/src/app/(marketing)/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GarageFlow — Deje de perder plata en su taller",
  description:
    "Software para talleres automotrices en República Dominicana: recepción con foto y firma, órdenes de trabajo, facturación con ITBIS, cuentas por cobrar y más. Prueba gratis 15 días.",
};

export default function LandingPage() {
  return <main id="inicio" className="flex-1" />;
}
```

- [ ] **Step 5: Eliminar `apps/web/src/app/page.tsx`** (el redirect a `/dashboard`).

- [ ] **Step 6: Verificar build**

Run: `npm run build` (en `apps/web`)
Expected: build verde; ruta `/` listada como estática del grupo `(marketing)`.

- [ ] **Step 7: Commit**

```bash
git add -A apps/web/src/app apps/web/src/components/marketing
git commit -m "feat: shell de landing de marketing en / con constantes centralizadas"
```

---

### Task 2: Header sticky + Footer

**Files:**
- Create: `apps/web/src/components/marketing/header.tsx`
- Create: `apps/web/src/components/marketing/footer.tsx`
- Modify: `apps/web/src/app/(marketing)/layout.tsx` (montar ambos)

**Interfaces:**
- Consumes: `MARKETING` de `./constants`; `Logo` de `@/components/brand/Logo`.
- Produces: `MarketingHeader` y `MarketingFooter` (named exports, sin props).

- [ ] **Step 1: Header** — `MarketingHeader`: `<header>` sticky top-0 con blur/fondo translúcido sobre `--gf-bg`, borde inferior `border-border`. Contenido: `Logo` (link a `#inicio`), nav desktop con anclas `#funciones`, `#precio`, `#preguntas` (labels: "Funciones", "Precio", "Preguntas"), link "Entrar" → `MARKETING.loginHref`, botón primario `MARKETING.ctaPrimaryLabel` → `MARKETING.registerHref`. Móvil: nav de anclas oculto (los CTAs "Entrar" y botón primario permanecen visibles); sin hamburguesa JS — la página es one-page scrolleable. Usar `next/link` para rutas y `<a>` para anclas.

- [ ] **Step 2: Footer** — `MarketingFooter`: `<footer>` con `Logo`, tagline corta ("Control total de su taller, desde el celular."), columna de enlaces: "Entrar" (`loginHref`), "Portal del cliente" (`portalHref`), "Prueba gratis" (`registerHref`), y WhatsApp (`whatsappHref`, texto `whatsappDisplay`). Línea legal: `© {new Date().getFullYear()} GarageFlow`.

- [ ] **Step 3: Montar en layout**

```tsx
// apps/web/src/app/(marketing)/layout.tsx
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
```

- [ ] **Step 4: Verificar** — `npm run build` verde; `npm run dev` y revisar `/` en 320px y 1440px: header sticky, sin overflow horizontal.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/marketing apps/web/src/app/"(marketing)"/layout.tsx
git commit -m "feat: header sticky y footer de landing"
```

---

### Task 3: Hero con mockup CSS del dashboard

**Files:**
- Create: `apps/web/src/components/marketing/hero.tsx`
- Modify: `apps/web/src/app/(marketing)/page.tsx` (montar sección)

**Interfaces:**
- Consumes: `MARKETING` de `./constants`.
- Produces: `Hero` (named export, sin props).

- [ ] **Step 1: Hero** — Copy exacto:
  - Eyebrow: `Software para talleres automotrices · República Dominicana`
  - H1: `¿Cuánto pierde al mes en reclamos falsos y clientes que no pagan?`
  - Sub: `GarageFlow controla su taller completo — recepción con foto y firma, órdenes de trabajo, facturación y cuentas por cobrar — desde el celular o la computadora.`
  - CTA primario (botón grande, azul primario) → `registerHref`, label `ctaPrimaryLabel`, con nota debajo: `Sin tarjeta de crédito.`
  - CTA secundario (outline/ghost) → `whatsappHref`, label `ctaSecondaryLabel`, `target="_blank" rel="noopener noreferrer"`.
  - Mockup: tarjeta oscura (`bg-card`, borde `border-border`, sombra) simulando el dashboard con divs: barra superior con 3 puntos, fila de 3 KPIs ficticios en `font-mono` (`Vendido hoy RD$18,450`, `Carros en taller 7`, `Por cobrar RD$32,900` — este último en ámbar), y 3 filas simulando órdenes con badges de estado. Sin imágenes externas.
  - Composición: split en desktop (texto izquierda, mockup derecha), apilado en móvil. H1 en `font-display` grande.

- [ ] **Step 2: Montar en `page.tsx`**

```tsx
import { Hero } from "@/components/marketing/hero";
// dentro de <main id="inicio" className="flex-1">
<Hero />
```

- [ ] **Step 3: Verificar** — `npm run build` verde; revisar hero en 320/768/1440.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/marketing/hero.tsx apps/web/src/app/"(marketing)"/page.tsx
git commit -m "feat: hero de landing con mockup CSS del dashboard"
```

---

### Task 4: Dolores + Los 3 golpes de dinero

**Files:**
- Create: `apps/web/src/components/marketing/pains.tsx`
- Create: `apps/web/src/components/marketing/money-punches.tsx`
- Modify: `apps/web/src/app/(marketing)/page.tsx` (montar en orden)

**Interfaces:**
- Consumes: `MARKETING`; iconos `lucide-react`.
- Produces: `Pains`, `MoneyPunches` (named exports, sin props).

- [ ] **Step 1: `Pains`** — Franja "¿Le pasa esto en su taller?" (H2). Tres ítems, copy exacto:
  1. `Órdenes en papelitos que se pierden y nadie sabe qué le toca a cada mecánico.`
  2. `Un cliente reclama un rayón "que el carro no tenía" y usted termina pagando.`
  3. `Le deben plata y ni usted se acuerda de quién ni cuánto.`
  Tono visual: fondo levemente distinto (`bg-muted` o similar), iconos `lucide-react` (`FileWarning`, `CarFront`, `HandCoins`).

- [ ] **Step 2: `MoneyPunches`** — Sección estrella, acento ámbar. H2: `Tres formas en que GarageFlow le devuelve la plata`. Tres tarjetas grandes numeradas (01/02/03 en `font-mono` ámbar), copy exacto:
  1. Título `Deje de perder plata en reclamos` — texto `Foto y firma digital del cliente al recibir el vehículo. Si el rayón ya estaba, queda documentado. Cero pleitos.`
  2. Título `Cobre lo que le deben` — texto `Cuentas por cobrar con pagos parciales y lista clara de deudores. Nadie se le pierde.`
  3. Título `Haga que el cliente vuelva` — texto `Recordatorios automáticos por tiempo o kilometraje: "le toca el cambio de aceite". Recompra sola.`

- [ ] **Step 3: Montar ambos en `page.tsx`** debajo de `<Hero />`, en ese orden.

- [ ] **Step 4: Verificar** — `npm run build` verde; revisión visual 320/1440.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/marketing apps/web/src/app/"(marketing)"/page.tsx
git commit -m "feat: secciones de dolores y 3 golpes de dinero"
```

---

### Task 5: Grid de módulos + Cómo funciona

**Files:**
- Create: `apps/web/src/components/marketing/modules.tsx`
- Create: `apps/web/src/components/marketing/how-it-works.tsx`
- Modify: `apps/web/src/app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: `MARKETING`; iconos `lucide-react`.
- Produces: `Modules` (section `id="funciones"`), `HowItWorks` (named exports, sin props).

- [ ] **Step 1: `Modules`** — `<section id="funciones">`. H2: `Todo su taller en un solo sistema`. Grid responsive (1 col móvil / 2 tablet / 3 desktop) de 12 tarjetas dolor→solución. Data local en el archivo como array `{ icon, title, pain, pitch }`. Copy exacto (title — pain — pitch):
  1. `Recepción con foto y firma` — `"Mi carro entró sin ese rayón"` — `Checklist, fotos y firma al entrar. Cero pleitos.`
  2. `Órdenes de trabajo` — `Papelitos perdidos` — `Todo en pantalla, asignado a cada mecánico, con estado.`
  3. `Diagnóstico e historial` — `"¿Qué le hicimos a ese carro la otra vez?"` — `Timeline completo por vehículo.`
  4. `Cotizaciones aprobadas` — `"Yo no autoricé eso"` — `El cliente aprueba antes. Respaldo para usted.`
  5. `Facturación con ITBIS` — `Factura a mano, con errores` — `Numeración automática, ITBIS y PDF listo.`
  6. `Cuentas por cobrar` — `"¿Quién me debe?"` — `Deudores claros y pagos parciales al día.`
  7. `Caja` — `Plata que desaparece` — `Ingresos, egresos y balance diario.`
  8. `Inventario con alertas` — `Se acaba la pieza sin avisar` — `Alerta automática de stock mínimo.`
  9. `Compras y proveedores` — `Gastos sin control` — `Historial de compras y el stock sube solo.`
  10. `Recordatorios` — `El cliente no vuelve` — `Aviso de mantenimiento por tiempo o kilometraje.`
  11. `Portal del cliente` — `El teléfono no para: "¿ya está mi carro?"` — `El cliente ve el estado solo. Menos llamadas.`
  12. `Dashboard y reportes` — `¿Estoy ganando o perdiendo?` — `Ventas, productividad y KPIs en vivo.`
  Iconos sugeridos (lucide): `Camera, ClipboardList, History, FileCheck, Receipt, Wallet, PiggyBank, Package, Truck, BellRing, Smartphone, BarChart3`.

- [ ] **Step 2: `HowItWorks`** — H2: `Arranque hoy mismo`. Tres pasos numerados:
  1. `Regístrese gratis` — `15 días de prueba, sin tarjeta.`
  2. `Configure su taller en menos de 30 minutos` — `Sus mecánicos, sus servicios y los carros que tenga adentro ahora.`
  3. `Opere desde donde sea` — `Celular o computadora. Corre en la nube.`
  CTA al final del bloque → `registerHref` con `ctaPrimaryLabel`.

- [ ] **Step 3: Montar en `page.tsx`** debajo de `<MoneyPunches />`.

- [ ] **Step 4: Verificar** — `npm run build`; ancla `#funciones` navega bien desde el header; visual 320/768/1440.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/marketing apps/web/src/app/"(marketing)"/page.tsx
git commit -m "feat: grid de 12 modulos y seccion como funciona"
```

---

### Task 6: Precio + FAQ + CTA final

**Files:**
- Create: `apps/web/src/components/marketing/pricing.tsx`
- Create: `apps/web/src/components/marketing/faq.tsx`
- Create: `apps/web/src/components/marketing/final-cta.tsx`
- Modify: `apps/web/src/app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: `MARKETING`.
- Produces: `Pricing` (section `id="precio"`), `Faq` (section `id="preguntas"`), `FinalCta` (named exports, sin props).

- [ ] **Step 1: `Pricing`** — `<section id="precio">`. Tarjeta única centrada, precio protagonista en `font-mono` con acento ámbar. Copy exacto:
  - H2: `Un solo plan. Todo incluido.`
  - Precio: `RD$2,500` + `/mes por taller` (usar `MARKETING.priceMonthly`).
  - Anclaje: `Menos de RD$85 al día — un solo reclamo evitado lo paga.`
  - Bullets: `Todos los módulos, sin límites` · `Usuarios ilimitados` · `Soporte y configuración inicial incluidos` · `Sin contrato de permanencia`.
  - CTA → `registerHref`, label `ctaPrimaryLabel`, nota `Sin tarjeta de crédito.`

- [ ] **Step 2: `Faq`** — `<section id="preguntas">`, H2: `Preguntas de taller` . 5 `<details>` estilizados (summary con chevron CSS, sin JS). Copy exacto (pregunta — respuesta):
  1. `¿Y no es caro?` — `¿Cuánto perdió el mes pasado en un reclamo o en una cuenta que no cobró? GarageFlow cuesta menos de RD$85 al día y se paga solo.`
  2. `Yo no sé mucho de computadora` — `Es fácil. Se lo dejamos configurado y le enseñamos a usted y a su equipo. Si sabe usar WhatsApp, sabe usar esto.`
  3. `Ya llevo todo en mi cuaderno` — `El cuaderno no le avisa cuándo le toca mantenimiento al cliente ni quién le debe. GarageFlow sí.`
  4. `¿Y si se va la luz o el internet?` — `Corre en la nube: entra desde el celular con sus datos. No depende de una computadora en el taller.`
  5. `Déjeme pensarlo` — `Pruébelo gratis 15 días con los carros reales de su taller, sin tarjeta. Si no le sirve, no paga nada.`

- [ ] **Step 3: `FinalCta`** — Banda de cierre de alto contraste. H2: `Le configuramos su taller hoy mismo. ¿Arrancamos?`. Sub: `Empiece con los carros que tiene adentro ahora.` Ambos CTAs (primario `registerHref`, secundario `whatsappHref`).

- [ ] **Step 4: Montar en `page.tsx`** — orden final del `<main>`: `Hero, Pains, MoneyPunches, Modules, HowItWorks, Pricing, Faq, FinalCta`.

- [ ] **Step 5: Verificar** — `npm run build`; anclas `#precio` y `#preguntas` funcionan; `<details>` abre/cierra sin JS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/marketing apps/web/src/app/"(marketing)"/page.tsx
git commit -m "feat: precio unico, FAQ de objeciones y CTA final"
```

---

### Task 7: Verificación final

**Files:**
- Modify: solo fixes que salgan de la verificación.

- [ ] **Step 1: Lint + build** — `npm run lint` y `npm run build` en `apps/web`. Expected: cero errores.
- [ ] **Step 2: Revisión visual** — `npm run dev`, revisar `/` en 320 / 768 / 1440: sin overflow horizontal, jerarquía clara, header sticky funcional, mockup del hero legible en móvil.
- [ ] **Step 3: Checklist de enlaces** — CTAs primarios → `/register` (página carga); "Entrar" → `/login`; WhatsApp abre `wa.me/18296321220` con texto prellenado; 3 anclas del header navegan a su sección.
- [ ] **Step 4: Regresión de rutas** — `/dashboard` y `/login` siguen funcionando (login redirige o carga normal); `/` ya no redirige.
- [ ] **Step 5: Grep de guardas** — `grep -r "use client" src/components/marketing src/app/"(marketing)"` → sin resultados. `grep -ri "tallerfacil" src/components/marketing src/app/"(marketing)"` → sin resultados.
- [ ] **Step 6: Commit de fixes (si hubo)**

```bash
git add -A apps/web
git commit -m "fix: ajustes de verificacion visual de landing"
```
