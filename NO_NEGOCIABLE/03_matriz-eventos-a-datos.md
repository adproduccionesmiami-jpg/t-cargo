# 03_MATRIZ_EVENTOS_A_DATOS — T-Cargo (AD-8)

## 1. Principio Rector

Toda acción visible en pantalla debe afectar una tabla específica, modificar campos definidos, pasar validaciones obligatorias y respetar integridad y RLS (BD manda).

## 2. Matriz Global de Eventos (Versión T-Cargo)

| Pantalla | Acción del Usuario | Tabla Afectada | Tipo Operación | Validaciones (BD) | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Login** | Iniciar sesión | auth.users + app_users | SELECT | Auth válido; is_active=true | Perfil cargado; acceso RLS |
| **Viajes (Lista)**| Consultar lista | trip_financials (VIEW) | SELECT | RLS de roles | Lista + KPIs coherentes |
| **Viajes (Lista)**| Filtrar lista | trip_financials (VIEW) | SELECT | Parámetros válidos | Lista filtrada |
| **Nuevo Viaje** | Seleccionar Chapa | vehicles | SELECT | Listar chapas activas | Chapa vinculada al viaje |
| **Nuevo Viaje** | Guardar viaje | trips + audit_log | INSERT | amount_value >= 0; status OK | Viaje creado e indexado |
| **Detalle Viaje** | Consultar detalle | trips + financials + expenses | SELECT | RLS | Header + Resumen + Gastos |
| **Detalle Viaje** | Cambiar estado | trips + audit_log | UPDATE | Transición válida | Estado y auditoría actualizados |
| **Actualizar FX** | Guardar FX | trips + audit_log | UPDATE | fx_usd_to_cup > 0 | FX y gastos recalculados |
| **Agregar Gasto** | Guardar gasto | trip_expenses + audit_log | INSERT | amount > 0; logic calculations | Gasto creado; equiv_usd calculado |
| **Editar Gasto** | Actualizar gasto | trip_expenses + audit_log | UPDATE | Mismas validaciones | Totales y auditoría actualizados |
| **Eliminar Gasto** | Eliminar gasto | trip_expenses + audit_log | DELETE | Confirmación RLS | Gasto eliminado y recalculado |

## 3. Tipos de Operación Permitidos

- **INSERT**
- **UPDATE**
- **DELETE**
- **SELECT**
- **UPDATE PARCIAL**

## 4. Eventos Críticos (Alta Sensibilidad)

| Evento | Riesgo | Control Adicional (BD) |
| :--- | :--- | :--- |
| **Actualizar FX** | Alto | Auditoría obligatoria + recalculo masivo |
| **Eliminar gasto** | Alto | Auditoría + confirmación + bloqueo en Completados |
| **Modificar monto** | Alto | Auditoría + recalculo total income |
| **Cambiar a Cancelado**| Medio | Registro de razón en payload de auditoría |

## 5. Eventos que Disparan Recalculos (BD)

- **Insert/Update Gasto**: Recalcula `equivalent_usd` e impacto en totales.
- **Update FX**: Recalcula todos los `equivalent_usd` (CUP) del viaje y totales de la VIEW.
- **Update Ingreso**: Recalcula `income_usd_equiv`, comisiones (5%/5%) y utilidad.
- **Delete Gasto**: Dispara SUM total de gastos y reajuste de utilidad.

## 6. Eventos que Requieren Auditoría (audit_log)

Se registra obligatoriamente:

- Crear viaje (payload inicial).
- Cambiar estado (old/new value).
- Actualizar FX (valor anterior/nuevo).
- Operaciones con Gastos (before/after snapshots).

## 7. Flujo de Validación por Acción

1. Validar rol y permisos (RLS).
2. Validar tipos de datos y CHECKs en BD.
3. Validar integridad relacional (FK).
4. Ejecutar operación (idealmente vía RPC).
5. UI refresca consumiendo el output de la VIEW (sin lógica en FE).

## 10. Estado del Documento

**COMPLETO**
