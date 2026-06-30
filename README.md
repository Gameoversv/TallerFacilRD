# TallerFacilRD

Sistema de gestión integral para talleres automotrices en República Dominicana. Plataforma **multi-tenant** SaaS que cubre el ciclo completo: recepción de vehículos, órdenes de trabajo, diagnóstico, cotizaciones, inventario, facturación, cuentas por cobrar, caja y portal del cliente.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Spring Boot 3 · Java 21 |
| Frontend | Next.js 15 · React 19 · TypeScript |
| Base de datos | PostgreSQL |
| Migraciones | Flyway |
| Auth | JWT · Spring Security (roles por tenant) |
| Contenedores | Docker · Docker Compose |
| Proxy | Nginx |
| Testing | JUnit 5 · Testcontainers · MockMvc |

## Módulos Implementados

### Operaciones del Taller
- **Recepciones** — registro de entrada de vehículos con checklist de inspección visual, niveles, documentación de daños y severidad
- **Firma Digital** (MOD-28) — captura de firma del cliente al momento de la recepción
- **Órdenes de Trabajo** — creación, asignación a mecánico, estados y seguimiento
- **Diagnóstico** (MOD-05) — registro de diagnóstico con prioridad, editable desde la OT
- **Historial de Vehículo** (MOD-15) — timeline completo: recepciones, OTs, facturas e ítems por vehículo

### Comercial y Finanzas
- **Cotizaciones** (MOD-07) — mano de obra, piezas, ITBIS opcional, aprobación de cliente
- **Facturación** (MOD-10) — numeración automática, pre-llenado desde OT, ITBIS opcional, impresión PDF
- **Cuentas por Cobrar** (MOD-11) — pagos parciales, estados y seguimiento
- **Caja** (MOD-12) — ingresos, egresos y balance general

### Inventario y Compras
- **Inventario** (MOD-08) — productos, categorías, alertas de stock mínimo
- **Compras** (MOD-09) — proveedores, historial de compras, incremento de stock automático

### Personas y Configuración
- **Clientes** (MOD-02) — CRUD completo con vehículos asociados
- **Empleados** (MOD-13) — CRUD con roles y activación
- **Recordatorios** (MOD-17) — notificaciones por tiempo transcurrido y kilometraje

### Reportes y Analytics
- **Dashboard** (MOD-01) — KPIs, actividad reciente, alertas de stock
- **Reportes** (MOD-18) — ventas, inventario y productividad de mecánicos con gráficas

### Multi-tenant y Administración
- **Multi-tenant** (MOD-21) — aislamiento completo a nivel de aplicación por `tenantId`
- **Super Admin** (MOD-22) — panel global, gestión de tenants, aprobación, impersonación y audit log
- **Portal del Cliente** (MOD-19) — acceso externo para consultar estado de OT y historial

## Estructura del Proyecto

```
TallerFacilRD/
├── apps/
│   ├── api/                    # Spring Boot 3 — REST API
│   │   └── src/
│   │       ├── main/java/rd/tallerfacil/api/
│   │       │   ├── auth/       # JWT, roles, registro
│   │       │   ├── reception/  # Recepciones + checklist
│   │       │   ├── workorder/  # Órdenes de trabajo
│   │       │   ├── quote/      # Cotizaciones
│   │       │   ├── invoice/    # Facturación
│   │       │   ├── payment/    # Pagos
│   │       │   ├── cash/       # Caja
│   │       │   ├── inventory/  # Inventario
│   │       │   ├── purchase/   # Compras
│   │       │   ├── customer/   # Clientes
│   │       │   ├── vehicle/    # Vehículos
│   │       │   ├── employee/   # Empleados
│   │       │   ├── reminder/   # Recordatorios
│   │       │   ├── reports/    # Reportes
│   │       │   ├── portal/     # Portal del cliente
│   │       │   ├── tenant/     # Multi-tenant
│   │       │   ├── superadmin/ # Panel super admin
│   │       │   └── dashboard/  # KPIs
│   │       └── resources/db/migration/  # 23 migraciones Flyway
│   └── web/                    # Next.js 15 — Frontend
│       └── src/app/
│           ├── (auth)/         # Login / registro
│           ├── (dashboard)/    # Módulos del taller
│           ├── (portal)/       # Portal cliente
│           └── (super-admin)/  # Admin global
├── infra/
│   ├── docker-compose.yml      # PostgreSQL + Nginx
│   └── nginx/
└── .github/workflows/          # CI — GitHub Actions
```

## Levantar en local

**Requisitos:** Docker, Java 21, Node.js 20+

```bash
# 1. Infraestructura
cd infra
docker compose up -d

# 2. Backend
cd apps/api
./mvnw spring-boot:run

# 3. Frontend
cd apps/web
npm install
npm run dev
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar:

```bash
cp .env.example .env
```

Variables requeridas: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION_MS`

## Testing

```bash
cd apps/api

# Unit + integration tests (Testcontainers — requiere Docker)
./mvnw test
```

Cobertura de integration tests: Auth, Clientes, Recepciones, Cotizaciones, Facturas, Portal.

## Convenciones de desarrollo

- **Branches:** `feat/mod-XX-descripcion`, `fix/descripcion`
- **Commits:** Conventional Commits (`feat:`, `fix:`, `test:`, `chore:`)
- **PRs:** todos los cambios entran via Pull Request a `main`
- **Sin credenciales en código** — todo via variables de entorno

## Licencia

MIT
