# 09_MODELO_PAQUETERIA (AD-8)

## 1. Principio Hector

Este documento define la estructura en Base de Datos para el nuevo módulo de "Paquetería" (Modelo de Renta de Equipos), independiente de "Socio Operativo/Viajes".

## 2. Entidades Principales

| Nombre de la Tabla | Propósito | Nivel |
| :--- | :--- | :--- |
| **deliveries** | Entregas (cabecera). Registra el servicio de renta (origen, destino, estado, ingreso bruto) y la auditoría mecánica (millaje y combustible cargado por el cliente). | Principal |
| **delivery_expenses** | *Opcional/Emergencia*. Gastos extraordinarios de mantenimiento asumidos por los socios. NO incluye combustible ni comisiones. | Soporte |
| **delivery_financials (VIEW)** | Vista maestra. Calcula el equivalente USD, rinde de combustible (KM/L) y partición de utilidad neta (50/50) sin deducir insumos. | Soporte |

## 3. Definición Técnica de Tabla: `deliveries`

| Campo | Tipo de Dato | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- |
| id | UUID | Sí | PK |
| delivery_date | DATE | Sí | Fecha del servicio. |
| plate_id | UUID | Sí | FK a `vehicles.id` (Chapa). |
| status | TEXT | Sí | Programado/En curso/Completado/Cancelado. |
| amount_currency | TEXT | Sí | Moneda del ingreso. Por defecto **CUP**. |
| amount_value | NUMERIC | Sí | Monto cobrado al cliente. |
| fx_usd_to_cup | NUMERIC | Sí | Tasa de fluctuación. |
| origin | TEXT | No | Origen del viaje. |
| destination | TEXT | No | Destino del viaje. |
| mileage_start | NUMERIC | No | Millaje al arrancar. |
| mileage_end | NUMERIC | No | Millaje de cierre de la renta. |
| fuel_liters | NUMERIC | No | Litros de combustible abastecidos por el cliente (solo para auditoría). |
| notes | TEXT | No | Incidencias. |
| created_by_user_id | UUID | Sí | Usuario que registró (FK a `app_users`). |
| creado_en / actualizado_en | TIMESTAMP| Sí | Auditoría nativa. |

## 4. Campos Calculados (Vista `delivery_financials`)

| Campo | Lógica (BD) |
| :--- | :--- |
| **income_usd_equiv** | `si USD → amount; si CUP → amount / fx_usd_to_cup`. (Ingreso base en USD) |
| **km_recorridos** | `(mileage_end - mileage_start) * 1.609344`. (Traducción matemática de Millas a Kilómetros). |
| **fuel_yield_actual** | `km_recorridos / fuel_liters`. (Para auditar el motor Volvo D13). |
| **profit_usd_equiv** | `income_usd_equiv - expenses_usd_equiv`. (Asumiendo 0 gastos extra en el 99% de las veces). No hay deducción de combustible ni broker. |
| **partner_a_share_usd**| `profit_usd_equiv * 0.5`. (Mitad para Socio A). |
| **partner_b_share_usd**| `profit_usd_equiv * 0.5`. (Mitad para Socio B). |

## 5. Reglas de Negocio a Codificar en DB

1. **NO HAY** Comisión 5% de Chofer.
2. **NO HAY** Comisión 5% de Broker.
3. El combustible **no se multiplica por un precio**, solo se almacena `fuel_liters` para dividir los kilómetros y sacar el rendimiento.
4. UI pedirá moneda por defecto **CUP**.

---
**ESTADO:** Pendiente de revisión por parte de la Gerencia.
