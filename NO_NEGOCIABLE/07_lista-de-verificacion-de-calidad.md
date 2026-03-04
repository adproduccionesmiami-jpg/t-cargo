# 07_LISTA_DE_VERIFICACIÓN_DE_CALIDAD — T-Cargo (AD-8)

## 1. Principio Rector

Nada se entrega sin pasar esta verificación completa. Si un punto falla, el sistema no está aprobado.

## 2. Validación del Modelo de Datos (contra 02)

- [ ] Tablas coinciden exactamente: `app_users`, `vehicles`, `trips`, `trip_expenses`, `audit_log`, `trip_financials`.
- [ ] FKs implementadas correctamente.
- [ ] Enumeraciones (`status`, `rol`, `currency`, `pay_method`, `expense_type`) cerradas en BD.
- [ ] Campos calculados (`equivalent_usd`) protegidos contra edición manual.

## 3. Validación de Eventos y Lógica (contra 03)

- [ ] Login carga perfil de `app_users`.
- [ ] Crear viaje, Agregar gasto y Actualizar FX funcionan con impacto en BD.
- [ ] Recalculos automáticos en BD validados (FX -> Gastos).
- [ ] RLS bloquea acceso no autorizado.

## 4. Validación de Permisos por Rol (RLS)

- [ ] Deny-by-default activo.
- [ ] Sin perfiles en `app_users` -> 0 acceso.
- [ ] `is_active=false` bloquea operación.

## 5. Validación de Flujo y UX (contra 05)

- [ ] Flujo: Login -> Lista -> Detalle -> Operación.
- [ ] Mensajes de error claros y no técnicos.
- [ ] Responsive Mobile-First validado.

## 6. Validación de Marca

- [ ] Dark Premium + Acento Ámbar en CTAs.
- [ ] Sin placeholders ni textos de prueba.

## 8. Pruebas de Escenarios Reales

- [ ] **Escenario 1 (USD + mixtos):** Verificación de comisiones (5%/5%) y utilidad (50/50).
- [ ] **Escenario 2 (CUP + FX):** Bloqueo de gastos CUP si el FX no está definido.
- [ ] **Escenario 3 (Cierre):** Bloqueo de edición de gastos en viajes "Completados".

## 9. Prueba de Casos Extremo

- [ ] Intentos de duplicación de IDs/Chapas.
- [ ] Intentos de modificación de campos protegidos.

## 11. Resultado Final de Calidad

**EN PROCESO**
