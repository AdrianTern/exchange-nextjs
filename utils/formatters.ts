// Format a number as a currency string (e.g., "1,234.56")
export const formatCurrency = (value: number, currency: string): string =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
    }).format(value);

// Format a percentage (e.g., "+1.10%")
export const formatPercentage = (value: number): string =>
    `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;

// Format a standard date string
export const formatDate = (dateStr: string): string =>
    new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(dateStr));
