

import { useQuery } from '@tanstack/react-query';
import { RateConversion } from '@/types/exchange';

/**
 * Custom hook for fetching real-time currency conversion data.
 * 
 * DESIGN PATTERN: Data Fetching / Server State Management
 * This hook encapsulates the TanStack Query logic, providing a clean interface
 * for components to consume conversion data without worrying about loading/error states.
 * 
 * @param {string} from Base currency code (e.g., 'USD')
 * @param {string} to Target currency code (e.g., 'EUR')
 * @param {number} amount Amount to convert
 * @returns {QueryResult<RateConversion>}
 */
export const useConversion = (from: string, to: string, amount: number, options?: { enabled?: boolean }) => {
    return useQuery<RateConversion>({
        // The queryKey is a unique identifier for this specific request.
        // Whenever from, to, or amount changes, TanStack Query automatically 
        // triggers a new fetch (reactive fetching).
        queryKey: ['conversion', from, to, amount],

        queryFn: async () => {
            const response = await fetch(
                `/api/convert?from=${from}&to=${to}&amount=${amount}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch conversion');
            }
            return response.json();
        },

        // Only run the query if all required parameters are available and valid.
        enabled: (options?.enabled ?? true) && !!from && !!to && amount > 0,

        // Cache management: Keep data fresh but avoid excessive API calls.
        staleTime: 1000 * 60, // 1 minute
    });
};
