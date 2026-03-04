# 01_MAPA_DEL_CLIENTE — T-Cargo

## 1. Identificación del Proyecto

**Nombre del cliente:** T-Cargo (Operación interna: Sociedad 1 + Socio Operativo)
**Nombre del proyecto:** T-Cargo — MVP Web App (Viajes + Finanzas)
**Fecha de inicio:** 03/04/2026
**Responsable del proyecto:** Alain
**Versión del documento:** v1.0

## 2. North Star (Resultado Singular Deseado)

La aplicación debe permitir controlar cada viaje con visibilidad financiera inmediata y confiable, para que en menos de 60 segundos se pueda abrir un viaje y ver: estado, ruta, chapa, ingreso, gastos (USD/CUP), equivalente USD, utilidad neta y reparto 50/50, sin cálculos manuales.
Éxito real = BD como motor: toda validación, equivalencia, reglas, estados, totales, utilidad y distribución se calculan en la base de datos (Supabase/Postgres) y la UI solo muestra resultados.

## 3. Problema Real a Resolver

**Problema principal:** Control financiero operativo de viajes disperso (cálculos manuales, inconsistencias con FX, gastos en monedas mixtas y comisiones).

**Problemas secundarios:**

- Falta trazabilidad por viaje (qué se gastó, cuándo, en qué moneda, y quién lo registró).
- FX aplicado de forma tardía o inconsistente, generando discrepancias.
- Utilidad y reparto se convierten en discusión, no en dato.

**Consecuencias actuales del problema:**

- Decisiones con datos incompletos o erróneos.
- Pérdidas por fugas pequeñas acumuladas (gastos mal capturados / FX mal aplicado).
- Tiempo perdido en “cuadres” y reconciliación.

**Impacto económico/operativo actual:**

- Sobre-costos por errores y atrasos.
- Falta de control fino de rentabilidad por viaje y por rastra.

## 4. Alcance del MVP (Fase 1)

### Incluye

- **Pantalla 0 — Login (Email/Password):** autenticación con Supabase Auth. La autorización real se impone por RLS.
- **Pantalla 1 — Viajes (Lista):** KPIs esenciales + filtros + tabla de viajes (mobile-first).
- **Pantalla 2 — Detalle de Viaje:** resumen financiero (USD equiv), estado, FX, tabla de gastos, totales y utilidad.
- **Modal — Nuevo Viaje:** crea viaje con datos mínimos (fecha, ruta, chapa, ingreso, moneda) y estado inicial.
- **Modal — Agregar Gasto:** registra gasto en USD o CUP + método de pago + tipo + nota; equivalente USD calculado en BD.
- **Modal — Actualizar FX:** actualiza fx_usd_to_cup del viaje (cuando aplique) y dispara recálculo BD.
- **Monedas:** solo USD y CUP.
- **Reglas fijas (BD):**
  - Chofer: 5% del monto del viaje.
  - Broker: 5% como gasto interno (sin rol/login).
  - Utilidad: reparto fijo 50/50 (Socio A / Socio B), no editable.
- **Estados limitados:** Programado / En curso / Completado / Cancelado.
- **Seguridad:** RLS estricta para sociedad1_admin y socio_operativo.

### No incluye (Explícitamente fuera de alcance)

- Cuentas por cobrar, facturación, clientes externos.
- Integraciones (WhatsApp/Email), notificaciones, automatizaciones externas (Fase 1).
- BI avanzado / reportes complejos (solo KPIs MVP).
- Módulo de mantenimiento avanzado por vehículo (solo registro de gastos si aplica).
- Multi-tenant o acceso para terceros (solo operación interna).

## 5. Fuente de Verdad Actual

**Descripción:** La BD es la fuente de verdad y el motor: cálculos, equivalencias, reglas, validaciones, RLS, funciones RPC y consistencia financiera.

## 6. Integraciones Necesarias

| Servicio | ¿Se usará? | ¿API disponible? | Estado de credenciales |
| :--- | :--- | :--- | :--- |
| Supabase | Sí | Sí | Lista |
| Pasarela de pago | No | — | — |
| WhatsApp / Email | No (Fase 1) | — | — |

## 7. Tipos de Usuario del Sistema

| Rol | Qué puede ver | Qué puede hacer | Restricciones |
| :--- | :--- | :--- | :--- |
| sociedad1_admin | Todos los viajes + finanzas + gastos | Crear/editar viajes, agregar/editar gastos, actualizar FX, cambiar estado | RLS: acceso total permitido |
| socio_operativo | Viajes + finanzas + gastos según policies | Crear/editar viajes, agregar gastos, actualizar FX, cambiar estado | RLS: acceso operativo |

## 8. Reglas de Negocio No Negociables

1. Toda lógica vive en BD: cálculos, validaciones, estados, FX, equivalencias, totales, utilidad y distribución.
2. RLS manda: aunque alguien “loguee”, si no cumple policies, no ve ni escribe nada.
3. Monedas: solo USD y CUP.
4. FX: vive a nivel de viaje (fx_usd_to_cup) y se usa para equivalencias cuando aplique.
5. Chofer: comisión fija 5% por viaje.
6. Broker: 5% como gasto interno sin rol/login.
7. Utilidad: reparto fijo 50/50 (Socio A / Socio B), no editable.
8. Estados permitidos: Programado / En curso / Completado / Cancelado.
9. Chapas reales: P 170 184 y P 170 185 (identificadores operativos).

## 9. Restricciones Técnicas o de Marca

- **Idioma obligatorio:** Español 100%.
- **Estética obligatoria:** Dark premium, minimal, alto contraste; acento ámbar solo para CTAs.
- **Tecnologías prohibidas:** lógica financiera en frontend; cálculos paralelos fuera de BD.
- **Responsive:** 100% responsive priorizando móvil (mobile-first).

## 10. Criterio de Éxito Medible

- **Métrica 1:** 100% de viajes muestran utilidad neta USD equiv consistente con gastos/FX.
- **Métrica 2:** Crear “Nuevo Viaje + 1 Gasto + FX” en < 2 minutos desde móvil.
- **Métrica 3:** 0 discrepancias por reglas fijas porque se aplican en BD.
- **Métrica 4:** Login + carga de viajes en < 5 segundos desde móvil.

## 11. Estado del Documento

**LISTO PARA PASAR A DISEÑO ESTRUCTURAL**

## 12. Resumen para SaaS Factory

T-Cargo MVP es una app web mobile-first para controlar viajes de rastras con enfoque financiero. Incluye Login y 2 pantallas principales. La BD es el motor de cálculo y seguridad (RLS). Reglas de comisiones y reparto intocables (5% chofer, 5% broker, 50/50 utilidad).
