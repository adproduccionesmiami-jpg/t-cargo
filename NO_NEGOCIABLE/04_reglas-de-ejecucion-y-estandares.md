# 04_REGLAS_DE_EJECUCIÓN_Y_ESTÁNDARES — T-Cargo (AD-8)

## 1. Principio Rector

Este documento actúa como contrato técnico. Toda implementación debe respetar estas reglas sin excepción. Si una instrucción entra en conflicto con este documento, prevalece este documento.

## 2. Tecnologías Permitidas

- **Backend:** Supabase
- **Base de datos:** PostgreSQL (Supabase)
- **Autenticación:** Supabase Auth (email/password)
- **Framework CSS:** Tailwind CSS
- **Regla AD-8:** Toda lógica de negocio, cálculos y permisos viven en BD (RPC/Views/Triggers/RLS). La UI solo muestra y captura inputs.

## 3. Tecnologías Prohibidas

- Librerías experimentales no auditadas.
- Manipulación directa del DOM fuera del framework.
- Lógica financiera o de permisos en el frontend.

## 4. Idioma y Estilo del Sistema

- **Idioma:** Español (100%)
- **Formato de fechas (UI):** MM/DD/YYYY
- **Moneda oficial:** USD (equivalente)
- **Tono:** Profesional, directo, operativo.
- **Formato numérico:**
  - Dinero: 2 decimales (ej. 1,234.56)
  - FX: hasta 4 decimales (ej. 325.5000)

## 5. Estándares de Diseño

- **Contraste:** Alto contraste (Dark Premium).
- **Estética T-Cargo:** Dark premium (grafito/negro), tipografía steel/plateado, acento ámbar solo para CTAs.
- **Responsive (Mobile-First):** Diseño definido primero en móvil. Desktop/tablet son expansión, no reinterpretación.

## 6. Reglas de Seguridad

- Autenticación obligatoria (Supabase Auth).
- Validación de permisos vía RLS obligatorio.
- Roles autorizados: `sociedad1_admin`, `socio_operativo`.

## 7. Reglas de Integridad de Datos

- FKs obligatorios, sin campos huérfanos.
- Prohibidos los NULL en campos críticos.
- Todo campo monetario debe incluir moneda.
- `trip_expenses.equivalent_usd` se calcula en BD y no se edita.

## 8. Definición de Terminado (DoD)

Una funcionalidad está terminada si:

1. Se ejecuta correctamente en BD.
2. Pasa validaciones RLS.
3. No genera errores de consola.
4. Cumple con el diseño Dark Premium.
5. Es consistente con los Documentos 02 y 03.

## 10. Cambios Posteriores

Cualquier modificación estructural exige actualizar primero el Modelo Maestro (02) y la Matriz de Eventos (03) antes de tocar el código.

## 11. Estado del Documento

**APROBADO**
