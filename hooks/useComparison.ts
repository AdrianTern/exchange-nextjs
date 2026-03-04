

import { useQuery } from '@tanstack/react-query';
import { RateComparison } from '@/types/exchange';

/**
 * Custom hook for fetching weekly (7-day) currency trend data.
 * 
 * DESIGN PATTERN: Data Fetching / Server State
 * This hook leverages TanStack Query to fetch and cache historical rate data,
 * providing the foundation for our time-series visualizations.
 * 
 * @param {string} from Base currency
 * @param {string} to Target currency
 */
export const useComparison = (from: string, to: string, options?: { enabled?: boolean }) => {
    return useQuery<RateComparison>({
        // Identifies the comparison pair in the cache.
        queryKey: ['comparison', from, to],

        queryFn: async () => {
            const response = await fetch(`/api/rates/compare?from=${from}&to=${to}`);
            if (!response.ok) {
                throw new Error('Failed to fetch comparison');
            }
            return response.json();
        },

        // Defensive check: Don't fetch if currencies aren't selected yet.
        enabled: (options?.enabled ?? true) && !!from && !!to,

        // Trends don't change frequently, so we can cache this longer.
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
