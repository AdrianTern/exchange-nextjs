'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { RateConversion } from '@/types/exchange';
import { formatCurrency } from '@/utils/formatters';

/**
 * Custom hook for monitoring exchange rates and triggering toast notifications.
 * 
 * DESIGN PATTERN: Side Effect Orchestration / Observer Pattern
 * This hook observes server state (rates) and reacts by triggering UI side effects (toasts).
 * 
 * @param {string} from Base currency
 * @param {string} to Target currency
 * @param {number} targetRate Threshold rate to trigger alert
 * @param {'ABOVE' | 'BELOW'} direction Direction of the threshold cross
 * @param {boolean} enabled User toggled alert state
 */
export const useRateAlert = (
    from: string,
    to: string,
    targetRate: number,
    direction: 'ABOVE' | 'BELOW',
    enabled: boolean
) => {
    // 1. IDEMPOTENCY REF: We use a ref to track the last alerted target.
    // This prevents the user from being spammed with the same notification 
    // every time the polling query refetches.
    const lastAlertedTarget = useRef<string | null>(null);

    // 2. POLLING QUERY: Fetches current rate at a fixed interval.
    const { data } = useQuery<RateConversion>({
        queryKey: ['rateAlert', from, to],
        queryFn: async () => {
            const response = await fetch(`/api/convert?from=${from}&to=${to}&amount=1`);
            if (!response.ok) {
                throw new Error('Failed to fetch rate for alert');
            }
            return response.json();
        },
        enabled: enabled && !!from && !!to && targetRate > 0,
        refetchInterval: 30000, // Background polling every 30s
    });

    // 3. LOGIC EFFECT: Checks if conditions are met whenever data returns.
    useEffect(() => {
        if (!data || !enabled) return;

        const currentRate = data.rate;
        const alertId = `${from}-${to}-${targetRate}-${direction}`;

        // Ensure we haven't already notified for this specific configuration
        if (lastAlertedTarget.current === alertId) return;

        let conditionMet = false;
        if (direction === 'ABOVE' && currentRate >= targetRate) {
            conditionMet = true;
        } else if (direction === 'BELOW' && currentRate <= targetRate) {
            conditionMet = true;
        }

        if (conditionMet) {
            // Trigger UI Notification (Non-blocking side effect)
            toast.success(
                `Rate Alert: ${from}/${to} is now ${direction.toLowerCase()} ${formatCurrency(
                    targetRate,
                    to
                )} (Current: ${formatCurrency(currentRate, to)})`,
                { duration: 6000 }
            );

            // Mark as alerted to prevent repetition
            lastAlertedTarget.current = alertId;
        }
    }, [data, targetRate, direction, from, to, enabled]);

    // 4. RESET EFFECT: Clear alert when user updates their threshold.
    useEffect(() => {
        lastAlertedTarget.current = null;
    }, [targetRate, direction, from, to]);
};
