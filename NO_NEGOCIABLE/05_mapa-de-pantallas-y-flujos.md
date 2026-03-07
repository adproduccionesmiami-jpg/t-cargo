# 05_MAPA_DE_PANTALLAS_Y_FLUJOS — T-Cargo (AD-8)

## 1. Principio Rector

T-Cargo no es una colección de pantallas, es un flujo operativo controlado para: crear viajes, registrar gastos, actualizar FX y ver rentabilidad real (USD equiv) sin cálculos manuales. Toda lógica vive en BD (RLS/RPC/Views/Triggers).

## 2. Mapa General del Sistema (Navegación)

| Jerarquía | Pantalla | Propósito |
| :--- | :--- | :--- |
| 1 | **Login** | Acceso seguro (Email/Password) |
| 2 | **Viajes (Panel/Lista)** | Dashboard operativo + KPIs financieros |
| 3 | **Detalle de Viaje** | Operación de viaje, gastos y FX |
| 4 | **Configuración** | Perfil y cierre de sesión |

## 3. Detalle por Pantalla

### Pantalla: Login

- **Objetivo:** Autenticación segura.
- **Elementos:** Email, Contraseña, Botón Ingresar.
- **Flujo BD:** Validar en Supabase Auth -> Cargar perfil de `app_users` -> Aplicar RLS.

### Pantalla: Viajes (Lista + KPIs)

- **Objetivo:** Visión general operativa y financiera.
- **KPIs (Mobile-first):** Total ingresos, Total gastos, Utilidad neta (USD equiv).
- **Tabla (Headers MAYÚS):** FECHA, RUTA, CHAPA, ESTADO, INGRESO, GASTO, UTILIDAD.
- **Acciones:** Nuevo Viaje (Drawer Mobile-First), Filtros, Ver Detalle.
- **Selector Chapa (Optimizado):** Lista limpia (solo matrículas P170184/P170185), sin alias, con scroll y cierre automático.

### Pantalla: Detalle de Viaje

- **Objetivo:** Operar el viaje y ver la "verdad financiera".
- **Secciones:**
  - Header (Chapa, Estado, Ruta).
  - Resumen (Ingreso, Gastos, 5% Chofer, 5% Broker, Utilidad [50/50]).
  - FX del viaje (Actualizar FX).
  - Tabla de Gastos (Agregar Gasto).
- **Acciones BD:** UPDATE status, UPDATE FX (recalculo masivo), INSERT gastos.

## 4. Flujo de Navegación Principal

1. Login -> 2. Viajes (Lista) -> 3. Tap en Fila -> 4. Detalle de Viaje -> 5. Operar (Gasto/FX/Estado).
*Si falla validación en BD:* Mostrar error claro y bloquear la acción en UI.

## 5. Estados del Sistema

- **Globales:** Cargando, Error, Vacío, Confirmado.
- **Viajes:** Programado, En curso, Completado, Cancelado.

## 6. Permisos (RLS manda)

| Pantalla/Acción | sociedad1_admin | socio_operativo |
| :--- | :--- | :--- |
| Login / Viajes (Lista) | Sí | Sí |
| Detalle / Crear Viaje | Sí | Sí |
| Agregar Gasto / FX | Sí | Sí |
| Eliminar Gasto | Sí | No |

## 10. Optimización UX (Mobile-first)

- Acciones primarias (CTA) visibles sin scroll.
- Máximo 3 taps para llegar a operaciones críticas.
- Tablas con scroll horizontal controlado en móvil.

## 12. Actualizaciones de Implementación (BD-First)

---

### [2026-03-05]: Implementación de Detalle de Viaje

- **Cambio:** Se han añadido los servicios `getTripById` y `getTripExpenses` en `trip-service.ts`.
- **Lógica:** Consumo directo de la vista `trip_financials` para asegurar coherencia total con los cálculos del backend.
- **Estado:** Pendiente de implementación de la UI en `/trips/[id]`.

### [2026-03-06]: Refactor UI de Kilómetros

- **Cambio:** Se ajustó la UI en `/trips/[id]/page.tsx` para redondear el campo `km_recorridos`.
- **Lógica:** La conversión de millas a kilómetros (factor 1.609344) en la BD puede generar múltiples decimales. La UI obligatoriamente mostrará este valor formateado con **1 solo decimal** (`maximumFractionDigits: 1`) para mantener limpieza visual.
