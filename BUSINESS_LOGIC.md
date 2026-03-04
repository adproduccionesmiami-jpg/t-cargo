# 📋 BUSINESS_LOGIC.md - T-Cargo MVP

> Generado por SaaS Factory (Basado en Mandato AD-8) | Fecha: 2026-03-04

## 1. Problema de Negocio

**Dolor:** Control financiero operativo de viajes disperso. Los cálculos manuales (por tasas de cambio fluctuantes - FX), el registro de gastos en monedas mixtas (CUP y USD) y el cómputo de comisiones generan inconsistencias, falta de visibilidad real e ineficiencia en ruta.
**Costo actual:** Inconsistencias financieras, horas perdidas en cuadrar números a mano en calculadoras o libretas, y falta de claridad inmediata sobre la utilidad real de un viaje en curso o completado.

## 2. Solución

**Propuesta de valor:** Una aplicación web (Mobile-First) que centraliza el control de viajes, aplicando toda la lógica de conversiones FX, comisiones y utilidades directamente en la base de datos para brindar visibilidad financiera inmediata, confiable y 100% automatizada.

**Flujo principal (Happy Path):**

1. El usuario inicia sesión (Email/Password).
2. Entra al Panel de Viajes y visualiza la lista con el KPI general (USD equiv).
3. Crea un nuevo viaje asignando Chapa y monto inicial (CUP o USD).
4. Registra gastos operativos (combustible, mantenimiento) en moneda local o extranjera y/o actualiza el tipo de cambio (FX).
5. El sistema (BD) recalcula instantáneamente equivalencias, comisiones (5% chofer, 5% broker), utilidad neta y el reparto 50/50.

## 3. Usuario Objetivo

**Rol:** `sociedad1_admin` (Control total) y `socio_operativo` (Carga de datos en terreno).
**Contexto:** Necesitan una herramienta extremadamente rápida y sin fricción visual para registrar datos de viaje desde sus teléfonos, sin tener que preocuparse de hacer conversiones matemáticas.

## 4. Arquitectura de Datos

**Input:**

- Datos básicos del viaje (Fecha, Chapa, Ingreso Base, Estado).
- Gastos Operativos (Tipo de gasto, Monto, Moneda: USD/CUP).
- Tasa de Cambio (FX USD a CUP).

**Output:**

- Consolidado Financiero (Ingreso USD Equivalente, Gastos USD Equivalente).
- Comisiones exactas (Chofer y Broker al 5%).
- Utilidad Neta y Distribución (Socio A 50%, Socio B 50%).

**Storage (Supabase tables confirmadas):**

- `app_users`: Perfiles y Roles (RBAC).
- `vehicles`: Catálogo de chapas predefinidas.
- `trips`: Cabecera del viaje y FX.
- `trip_expenses`: Gastos asociados al viaje.
- `audit_log`: Trazabilidad de operaciones críticas (FX, borrado).
- `trip_financials` (VIEW): Cerebro financiero (Cálculos de KPIs en tiempo real).

## 5. KPI de Éxito

**Métrica principal:** Abrir un viaje en el sistema y ver en **menos de 60 segundos** el estado, ruta, chapa, ingresos, gastos equivalentes en USD, utilidad neta y reparto 50/50, sin requerir una calculadora manual externa.

## 6. Especificación Técnica (Para el Agente)

### Features a Implementar (Feature-First)

```
src/features/
├── auth/           # Autenticación Email/Password (Supabase)
├── trips/          # Dashboard de viajes y creación de viajes
├── trip-detail/    # Vista de un viaje específico e ingreso de gastos/FX
└── shared/         # Componentes UI (Dark Premium + Ámbar CTA)
```

### Stack Confirmado

- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind 3.4
- **Backend:** Supabase (Auth + Database PostgreSQL)
- **Validación:** Zod
- **State:** Zustand
- **MCPs:** Next.js DevTools + Playwright + Supabase
- **Patrón:** BD-FIRST (Toda lógica financiera vive en Postgres).

### Próximos Pasos (SaaS Factory V3)

1. [x] Setup proyecto base (Alias y NO_NEGOCIABLE AD-8 configurado).
2. [x] Configurar Supabase (Proyecto enlazado y .env.local).
3. [x] Implementar BD-FIRST (Tablas, Triggers, Views y RLS).
4. [ ] Implementar Auth (Feature: auth).
5. [ ] Feature: trips (Lista y KPIs).
6. [ ] Feature: trip-detail (Ingreso y visualización de datos).
7. [ ] Testing E2E (Playwright MCP).
