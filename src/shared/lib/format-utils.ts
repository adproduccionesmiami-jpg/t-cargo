/**
 * Formatea un número de forma compacta (ej. 1.2k, 1.5M) para optimizar espacio en la UI.
 * @param value Número a formatear
 * @returns String formateado con sufijo k o M si corresponde
 */
export function formatCompactNumber(value: number): string {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1000000) {
        const formatted = (absValue / 1000000).toLocaleString('es-ES', {
            maximumFractionDigits: 1,
            minimumFractionDigits: 0
        });
        return `${sign}${formatted}M`;
    }

    if (absValue >= 1000) {
        const formatted = (absValue / 1000).toLocaleString('es-ES', {
            maximumFractionDigits: 1,
            minimumFractionDigits: 0
        });
        return `${sign}${formatted}k`;
    }

    return `${sign}${absValue.toLocaleString('es-ES', {
        maximumFractionDigits: 0
    })}`;
}

/**
 * Formatea un valor monetario de forma compacta con el símbolo de peso/dólar.
 * @param value Valor numérico
 * @returns String formateado ej: $1.2k
 */
export function formatCurrencyCompact(value: number): string {
    return `$${formatCompactNumber(value)}`;
}
