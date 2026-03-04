# 06_MATRIZ_DE_RIESGOS_Y_CONTROLES — T-Cargo (AD-8)

## 1. Principio Rector

Mejor bloquear una implementación dudosa que desplegar un sistema inestable. Esta matriz identifica riesgos técnicos, de seguridad, UX, marca y operativos antes de ejecución final.

## 2. Clasificación de Riesgos

- **Técnico:** Estructura, BD, lógica de negocio.
- **Seguridad:** Permisos (RLS), exposición de datos.
- **UX:** Confusión de flujo, fricción en móvil.
- **Marca:** Identidad visual (Dark Premium/Ámbar).
- **Operativo:** Impacto en procesos de negocio reales.

## 3. Matriz de Riesgos Detectados (T-Cargo)

| ID | Categoría | Descripción | Nivel Global |
| :--- | :--- | :--- | :--- |
| **R1** | Técnico | Eliminación de gastos/viajes sin validación ni auditoría | Crítico |
| **R2** | Seguridad | Exposición de datos sensibles pese a login | Alto |
| **R3** | UX | Flujo confuso en creación (viaje/gasto/FX) en móvil | Medio |
| **R4** | Técnico | Cálculos fuera de BD (frontend recalculando totales/FX) | Crítico |
| **R5** | Técnico | FX nulo con gastos en CUP -> Inconsistencia financiera | Crítico |
| **R6** | Seguridad | Acceso parcial de usuarios sin perfil válido | Alto |
| **R7** | Operativo | Editar/Eliminar gastos en viajes **Completados** | Crítico |
| **R8** | Marca | UI fuera del estilo Dark Premium / Ámbar | Medio |
| **R9** | Integridad | Campos calculados editables (`equivalent_usd`) | Alto |
| **R10**| Operativo | Mensajes de error no claros que generan duplicación | Medio |

## 4. Controles Obligatorios (Mitigación)

- **R1/R7 (Auditoría/Lock):** Confirmación doble + Log obligatorio en BD. Bloqueo de edición en viajes "Completados".
- **R2/R6 (Seguridad):** RLS estricta (deny-by-default). Bloqueo total si no hay perfil en `app_users`.
- **R4 (BD-First):** Prohibición técnica de lógica financiera en Frontend. Consumo exclusivo de VIEW/RPC.
- **R5 (Integridad FX):** Regla en BD: Gasto CUP requiere FX > 0 en cabecera de viaje.
- **R9 (Integridad Datos):** CHECK constraints + triggers para proteger campos calculados.

## 5. Riesgos Críticos (Bloquean Proyecto)

El proyecto se detendrá (**BLOQUEADO**) si:

1. La RLS está incompleta o falta validación de roles en backend.
2. Existe inconsistencia entre el Modelo de Datos (02) y las pantallas.
3. Se detecta lógica financiera en el frontend.
4. El FX permite inconsistencias con gastos en CUP.
5. Se permite modificar datos de viajes cerrados (Completados) sin auditoría/permiso especial.

## 11. Estado Final

**APROBADO CON CONTROLES**
