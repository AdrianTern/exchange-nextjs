export const getPreviousBusinessDay = (date: Date): string => {
    const result = new Date(date);
    result.setDate(result.getDate() - 1);

    // 0 is Sunday, 6 is Saturday
    while (result.getDay() === 0 || result.getDay() === 6) {
        result.setDate(result.getDate() - 1);
    }

    return result.toISOString().split('T')[0];
};

/**
 * Returns a date string (YYYY-MM-DD) for X days before the given date.
 */
export const getPastDate = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
};
