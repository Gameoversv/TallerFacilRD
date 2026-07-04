# Landing Page de Ventas — TallerFacilRD

**Fecha:** 2026-07-03
**Estado:** Aprobado por el usuario

## Objetivo

Página pública en `/` que vende TallerFacilRD a dueños de talleres automotrices en República Dominicana. Convierte el guion de `VENTAS-BRIEF.md` en un vendedor 24/7. Conversión primaria: registro a prueba gratis de 15 días. Conversión secundaria: chat de WhatsApp.

## Decisiones tomadas

| Decisión | Valor |
|----------|-------|
| Ubicación | Dentro de `apps/web` (Next.js 15 existente), route group `(marketing)` |
| CTA primario | "Prueba gratis 15 días" → `/register` (sin tarjeta) |
| CTA secundario | WhatsApp `wa.me/18296321220` con mensaje prellenado |
| Precio | Único: **RD$2,500/mes** por taller, todo incluido |
| Enfoque | One-page (sin subpáginas de funciones/precios) |
| Idioma | Español dominicano neutro, trato de "usted" |

## Arquitectura

- Nuevo route group `apps/web/src/app/(marketing)/` con `layout.tsx` propio (header + footer de marketing, sin chrome del dashboard) y `page.tsx` que sirve `/`.
- El `apps/web/src/app/page.tsx` actual (redirect a `/dashboard`) se **elimina** — la landing toma la raíz. Usuarios existentes entran por el botón "Entrar" → `/login`. Las rutas `(auth)`, `(dashboard)`, `(portal)` y `(super-admin)` no se tocan.
- **Server components puros, cero JS de cliente.** Menú móvil y FAQ con `<details>/<summary>` estilizados con CSS.
- Componentes en `apps/web/src/components/marketing/` (un archivo por sección).
- Número de WhatsApp como constante en un solo archivo (`marketing/constants.ts`) junto al precio y textos de CTA, para cambiarlos en un solo lugar.

## Secciones (orden de la página)

1. **Header sticky** — logo TallerFacilRD, anclas a Funciones / Precio / Preguntas, botón secundario "Entrar" (`/login`), botón primario "Prueba gratis".
2. **Hero** — gancho del brief: "¿Cuánto pierde al mes en reclamos falsos y clientes que no pagan?" + subtítulo (control total del taller desde el celular) + CTA primario y WhatsApp + mockup del dashboard construido en CSS/HTML (sin depender de screenshots reales).
3. **Dolores** — franja "¿Le pasa esto en su taller?": papelitos de órdenes perdidos, cliente que reclama un rayón que ya tenía, deudores que nadie recuerda.
4. **Los 3 golpes de dinero** — sección estrella, uno por tarjeta grande:
   1. Deja de perder plata en reclamos → foto + firma digital al recibir el vehículo.
   2. Cobra lo que te deben → cuentas por cobrar con pagos parciales.
   3. El cliente vuelve → recordatorios automáticos de mantenimiento.
5. **Módulos** — grid de 12 features de la tabla del brief, cada tarjeta con formato dolor → solución (recepción, órdenes, diagnóstico/historial, cotizaciones, facturación con ITBIS, cuentas por cobrar, caja, inventario, compras, recordatorios, portal del cliente, dashboard/reportes).
6. **Cómo funciona** — 3 pasos: (1) regístrese gratis, (2) taller configurado en menos de 30 minutos, (3) opere desde el celular o la computadora.
7. **Precio** — tarjeta única: RD$2,500/mes todo incluido, línea de anclaje "menos de RD$85 al día — un solo reclamo evitado lo paga", 15 días gratis sin tarjeta, sin contrato de permanencia.
8. **FAQ** — las 5 objeciones del brief como `<details>`: "¿Es caro?", "No sé de computadora", "Ya uso cuaderno", "¿Y si se va la luz o el internet?", "Déjeme pensarlo".
9. **CTA final** — cierre del guion ("Le configuramos su taller hoy mismo. ¿Arrancamos?") + ambos CTAs.
10. **Footer** — logo, WhatsApp, enlaces a login y portal del cliente.

## Dirección visual

- Estética taller/industrial: hero oscuro, acento ámbar (color de señalización de taller), tipografía grande y directa, jerarquía fuerte. Evitar look de template genérico.
- Mobile-first: el dueño de taller navega desde el celular.
- Solo propiedades animables por compositor (transform/opacity) si hay motion; sin librerías de animación.
- Tokens (colores, espaciado) como CSS custom properties o clases Tailwind consistentes con el proyecto.

## Manejo de errores / casos borde

- Página estática: sin fetch de datos, sin estados de error en runtime.
- Enlace de WhatsApp funciona sin JS (`https://wa.me/18296321220?text=...` URL-encoded).
- Si `/register` cambiara de ruta, el único punto a tocar es `marketing/constants.ts`.

## Verificación

- `npm run build` en `apps/web` pasa sin errores ni warnings de tipos.
- Revisión visual en 320 / 768 / 1440 px: sin overflow horizontal, jerarquía legible.
- Anclas del header navegan a las secciones correctas.
- CTAs apuntan a `/register`, `/login` y `wa.me` correctos.

## Fuera de alcance

- Subpáginas de marketing (features, precios, blog).
- Captura de leads con backend (formularios).
- Video demo, testimonios reales, analytics.
- Cambios en auth, dashboard o portal.
