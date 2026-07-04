# Brief de Ventas — TallerFacilRD

> **Instrucciones para GPT:** Toma este material y conviértelo en un guion de ventas pulido, profesional y persuasivo, listo para que un vendedor lo use frente a dueños de talleres automotrices en República Dominicana. Adapta el tono a un ambiente informal pero confiable. Prioriza el argumento de dinero (menos pérdidas, más cobros, recompra). Añade transiciones naturales, refuerza el manejo de objeciones y crea un cierre fuerte. Puedes proponer precios de referencia y un flujo de demo. Todo en español dominicano neutro.

---

## Qué es el producto

**TallerFacilRD** — Sistema de gestión integral (SaaS multi-tenant) para talleres automotrices en República Dominicana. Cubre el ciclo completo: recepción de vehículos, órdenes de trabajo, diagnóstico, cotizaciones, inventario, facturación, cuentas por cobrar, caja y portal del cliente.

**Stack:** Spring Boot + Next.js + PostgreSQL, corre en la nube, accesible desde celular o computadora.

---

## Funcionalidades = Argumentos de venta

Cada feature traducido a un dolor que resuelve. El taller no compra software, compra "dejar de perder plata".

| Módulo | Dolor del taller | Pitch |
|--------|-----------------|-------|
| Recepción + checklist + firma digital | Cliente reclama "mi carro entró sin ese rayón" | Foto y firma al entrar. Cero pleitos, cero pérdidas. |
| Órdenes de trabajo | Papelitos perdidos, mecánico no sabe qué hacer | Todo en pantalla, asignado, con estado. |
| Diagnóstico + historial de vehículo | "¿Qué le hicimos a ese carro la vez pasada?" | Timeline completo por placa. |
| Cotizaciones + aprobación del cliente | Cliente dice "yo no autoricé eso" | Cotización aprobada = respaldo legal. |
| Facturación + ITBIS + PDF | Factura a mano, errores, DGII | Numeración automática, ITBIS, PDF listo. |
| Cuentas por cobrar | "¿Quién me debe?" nadie sabe | Lista clara de deudores + pagos parciales. |
| Caja | Plata que desaparece | Ingresos, egresos y balance diario. |
| Inventario + alertas de stock | Se acaba una pieza sin avisar | Alerta de stock mínimo. |
| Compras + proveedores | Sin control de gastos | Historial + stock sube solo. |
| Recordatorios (km/tiempo) | Cliente no vuelve | Aviso "toca cambio de aceite" → recompra. |
| Portal del cliente | Teléfono suena "¿ya está mi carro?" | Cliente ve el estado solo. Menos llamadas. |
| Dashboard + reportes | Dueño no sabe si gana | KPIs, productividad de mecánicos, ventas. |
| Multi-tenant | (ventaja interna) | Se vende a muchos talleres desde un solo sistema. |

### Los 3 golpes de dinero (usar primero)
1. **Deja de perder plata en reclamos** → firma y foto al recibir el vehículo.
2. **Cobra lo que te deben** → cuentas por cobrar.
3. **El cliente vuelve** → recordatorios automáticos.

---

## Guion de venta (borrador a pulir)

Duración objetivo: 5-7 min. Dueño de taller = ocupado, informal, directo.

### Apertura (gancho, 20 seg)
> "¿Cuánto pierde al mes en carros que reclaman daños que no hizo, o en clientes que le deben y no aparecen? TallerFacilRD lo controla todo desde el celular o la computadora."

### Diagnóstico (preguntas — dejar que hable)
- ¿Cómo lleva las órdenes hoy? ¿Papel, cuaderno?
- ¿Sabe ahora mismo quién le debe?
- ¿Cómo factura? ¿A mano?
- ¿Le pasa que un cliente reclama un rayón que ya tenía?

### Demo (mostrar solo 3 cosas, NO todo)
1. Recepción con foto + firma digital.
2. Factura en un clic con PDF.
3. Dashboard: "mire, aquí ve cuánto vendió hoy".

### Manejo de objeciones

| Objeción | Respuesta |
|----------|-----------|
| "Es caro" | "¿Cuánto perdió el mes pasado en un reclamo? Esto se paga solo." |
| "No sé de computadora" | "Es fácil, se lo dejamos configurado y le enseñamos." |
| "Ya uso cuaderno" | "El cuaderno no le avisa cuándo vuelve el cliente ni quién le debe." |
| "¿Y si se va la luz o el internet?" | "Corre en la nube, entra desde el celular." |
| "Déjeme pensarlo" | "Le doy 15 días gratis, sin tarjeta. Pruébelo con carros reales." |

### Cierre
> "Le configuro su taller hoy mismo con sus mecánicos y empezamos con los carros que tenga adentro ahora. ¿Arrancamos?"

---

## Pendientes antes de vender (contexto para GPT)

Cosas que el taller preguntará y que conviene tener resueltas:

- [ ] **Precio definido** — plan mensual de referencia (ej: RD$1,500-3,000/mes por taller).
- [ ] **Demo con data de ejemplo** — taller lleno, no vacío. Vacío no vende.
- [ ] **Onboarding** — checklist para montar un taller nuevo en menos de 30 min.
- [ ] **Factura con NCF/DGII** — RD exige NCF. Confirmar que el módulo lo cumple.
- [ ] **WhatsApp** — en RD pega más que email para el portal del cliente.
- [ ] **Video demo 2 min** — para mandar por WhatsApp a los que no cierran en el momento.
- [ ] **Free trial self-service** — 15 días.
- [ ] **Hosting/dominio** — dónde vive en producción.

---

## Qué quiero de ti (GPT)

Entrega:
1. Guion de ventas final, pulido y natural, en formato conversacional.
2. Versión corta (elevator pitch de 30 seg) y versión larga (visita presencial).
3. Mensaje de WhatsApp de seguimiento para los que no cierran.
4. Tabla de precios sugerida con 2-3 planes.
