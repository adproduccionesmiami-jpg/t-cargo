# 02_MODELO_DE_DATOS_MAESTRO — T-Cargo (AD-8)

## 1. Principio Rector

Este modelo de datos es la estructura central de T-Cargo. Toda pantalla, acción o automatización depende de este modelo. Si algo no encaja aquí, no se construye.

## 2. Entidades Principales (Tablas del Sistema)

| Nombre de la Tabla | Propósito | Nivel |
| :--- | :--- | :--- |
| **app_users** | Usuarios de la app (perfil + rol), mapeados a Supabase Auth | Principal |
| **trips** | Viajes (cabecera) + FX + estado + ingreso base | Principal |
| **trip_expenses** | Gastos del viaje (USD/CUP) + método de pago + equivalente USD | Principal |
| **trip_financials (VIEW)** | Resumen financiero (ingresos, gastos, utilidad, reparto) | Soporte |
| **vehicles** | Catálogo de chapas permitidas (P170184, P170185) | Soporte |
| **audit_log** | Bitácora mínima de cambios críticos | Soporte |

**Nota AD-8:** Toda lógica vive en BD. Las pantallas consumen views / RPC y no recalculan nada.

## 3. Definición Técnica de Cada Tabla

### Tabla: app_users

Descripción: Perfil de usuario del sistema (mapeado a auth.users).

| Campo | Tipo de Dato | Obligatorio | Único | Editable | Descripción |
| :--- | :--- | :--- | :--- | :--- | :--- |
| id | UUID | Sí | Sí | No | PK |
| auth_user_id | UUID | Sí | Sí | No | FK a auth.users.id |
| nombre | TEXT | Sí | No | Sí | Nombre visible |
| email | TEXT | Sí | Sí | No | Copia controlada del email |
| rol | TEXT | Sí | No | Sí | sociedad1_admin / socio_operativo |
| is_active | BOOLEAN | Sí | No | Sí | Activo/inactivo |
| creado_en | TIMESTAMP | Sí | No | No | Fecha creación |

### Tabla: vehicles

Descripción: Lista cerrada de chapas válidas.

| Campo | Tipo de Dato | Obligatorio | Único | Editable | Descripción |
| :--- | :--- | :--- | :--- | :--- | :--- |
| id | UUID | Sí | Sí | No | PK |
| plate | TEXT | Sí | Sí | No | P170184, P170185 (normalizado) |
| alias | TEXT | No | No | Sí | Nombre corto opcional |

### Tabla: trips

Descripción: Cabecera del viaje. El FX e ingreso base viven aquí.

| Campo | Tipo de Dato | Obligatorio | Único | Editable | Descripción |
| :--- | :--- | :--- | :--- | :--- | :--- |
| id | UUID | Sí | Sí | No | PK |
| trip_date | DATE | Sí | No | Sí | Fecha del viaje |
| plate_id | UUID | Sí | No | Sí | FK → vehicles.id |
| status | TEXT | Sí | No | Sí | Programado/En curso/Completado/Cancelado |
| amount_currency | TEXT | Sí | No | Sí | USD o CUP |
| amount_value | NUMERIC | Sí | No | Sí | Monto en moneda original |
| fx_usd_to_cup | NUMERIC | No | No | Sí | Tasa USD→CUP del viaje |
| origin | TEXT | No | No | Sí | Ciudad de origen |
| destination | TEXT | No | No | Sí | Ciudad de destino |
| created_by_user_id | UUID | Sí | No | No | FK → app_users.id |

### Tabla: trip_expenses

Descripción: Gastos del viaje. Equivalente USD calculado en BD.

| Campo | Tipo de Dato | Obligatorio | Editable | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | Sí | No | PK |
| trip_id | UUID | Sí | No | FK → trips.id |
| expense_type | TEXT | Sí | Sí | fuel / broker_fee / driver_fee / maintenance / other |
| currency | TEXT | Sí | Sí | USD o CUP |
| amount | NUMERIC | Sí | Sí | Importe original |
| equivalent_usd | NUMERIC | Sí | No | **Calculado en BD** |

### Vista: trip_financials (VIEW)

Resumen calculado en BD con:

- `income_usd_equiv`
- `expenses_usd_equiv`
- `profit_usd_equiv`
- `driver_fee_usd_equiv` (5%)
- `broker_fee_usd_equiv` (5%)
- `partner_a_share_usd` (50% utilidad)
- `partner_b_share_usd` (50% utilidad)

## 4. Enumeraciones Oficiales

- **Estados:** Programado, En curso, Completado, Cancelado.
- **Roles:** sociedad1_admin, socio_operativo.
- **Monedas:** USD, CUP.
- **Tipos de gasto:** fuel, broker_fee (5%), driver_fee (5%), maintenance, other.

## 5. Reglas de Integridad Globales

- Todo campo monetario debe indicar moneda.
- Moneda estándar de reporting: USD equivalente.
- Cálculos críticos NO editables en UI (solo BD).
- RLS obligatorio: nadie opera sin policies.

## 6. Campos Calculados (BD)

| Campo | Origen | Lógica (BD) |
| :--- | :--- | :--- |
| equivalent_usd | trip_expenses | `si USD → amount; si CUP → amount / fx_usd_to_cup` |
| income_usd_equiv | trip_financials | `si USD → amount; si CUP → amount / fx_usd_to_cup` |
| km_recorridos | trip_financials | `(mileage_end - mileage_start) * 1.609344` |
| fuel_yield_actual | trip_financials | `km_recorridos / fuel_liters` |
| driver_fee | trip_financials | `(income_usd_equiv - fuel_cost_usd) * 0.05` |
| broker_fee | trip_financials | `(income_usd_equiv - fuel_cost_usd) * 0.05` |
| profit_usd_equiv| trip_financials | `income_usd_equiv - expenses_usd_equiv - driver_fee - broker_fee - fuel_cost_usd` |
| shares (50/50) | trip_financials | `profit_usd_equiv * 0.5` |

## 11. Estado del Documento

**APROBADO PARA IMPLEMENTACIÓN DIRECTA (BD-FIRST)**
