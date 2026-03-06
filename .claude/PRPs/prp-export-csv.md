# PRP: Exportación de Datos a CSV

> **Estado:** 📝 Borrador (Esperando validación de Alain)
> **Prioridad:** 🟢 Media
> **Dueño:** Alain

---

## 🎯 Objetivo
Permitir a los administradores descargar la información de los viajes en formato CSV para análisis contable externo, auditoría de socios y backups físicos.

## 🛠️ Especificaciones Técnicas

### 1. Ubicación en la UI
- **Botón:** Un icono de descarga (`Download`) minimalista situado en la cabecera de la lista de viajes del Dashboard.
- **Acción:** Solo exporta los resultados que están actualmente visibles (respeta los filtros de Fecha, Chapa y Temporalidad).

### 2. Estructura del CSV (Columnas)
| Columna | Descripción |
|---------|-------------|
| **Fecha** | Fecha del viaje (formato YYYY-MM-DD) |
| **Chapa** | Matrícula del vehículo |
| **Origen** | Ciudad de origen |
| **Destino** | Ciudad de destino |
| **Status** | Estado del viaje (En curso, Completado, Cancelado) |
| **Monto Original** | Valor del ingreso en su moneda base (USD/CUP) |
| **Moneda** | USD o CUP |
| **Tasa FX** | Tasa de cambio aplicada al viaje |
| **Ingreso (USD)** | Equivalente en dólares (calculado por BD) |
| **Gasto Combustible (USD)** | Costo del diésel en dólares |
| **Gasto Total (USD)** | Suma de Combustible + Comisiones + Otros |
| **Utilidad Neta (USD)** | Beneficio real después de todos los gastos |
| **Socio A / Socio B** | Reparto 50/50 de la utilidad |
| **KM Totales** | Distancia recorrida (si está completado) |
| **Rendimiento (KM/L)** | Eficiencia del vehículo |

### 3. Lógica de Implementación
- **Generación:** Se realizará en el cliente (Browser) para una descarga instantánea sin llamadas adicionales al servidor.
- **Nombre de Archivo:** Dinámico, ejemplo: `reporte-viajes-2026-03-06.csv`.

---

## ✅ Criterios de Aceptación
1. El archivo debe poder abrirse correctamente en Excel/Google Sheets.
2. Debe exportar exactamente lo que el usuario ve en pantalla (respetando filtros).
3. Debe incluir todas las columnas financieras clave blindadas en la base de datos.

---

## 📍 Estado del proyecto
- ✅ **Lógica de BD:** Blindada.
- ✅ **UI Detalle:** Optimizado.
- 📌 **Estado actual:** Propuesta de Exportación (PRP) generada.
- ▶️ **Siguiente paso:** Alain valida el PRP para proceder con la implementación.
