'use client';

import React, { memo } from 'react';
import { RateConversion } from '@/types/exchange';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface ExchangeResultProps {
    data?: RateConversion; // The conversion data result from the API
    isLoading: boolean; // Loading state passed from the parent orchestrator
}

/**
 * A presentation-only component that displays the calculated conversion result.
 * 
 * DESIGN PATTERN: Presentational Component (Dumb Component)
 * This component has no logic of its own. It simply renders the data it receives,
 * making it highly reusable and easy to test.
 * 
 * PERFORMANCE OPTIMIZATION: React.memo
 */
const ExchangeResult = memo(function ExchangeResult({ data, isLoading }: ExchangeResultProps) {
    // 1. LOADING STATE: Matches the high-emphasis layout to minimize layout shift.
    if (isLoading) {
        return (
            <div className="flex flex-col items-center space-y-4 animate-pulse w-full">
                <div className="h-12 bg-white/5 rounded-xl w-[260px]"></div>
                <div className="flex flex-col items-center space-y-2">
                    <div className="h-4 bg-white/5 rounded-lg w-32"></div>
                    <div className="h-3 bg-white/5 rounded-lg w-40 opacity-50"></div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="flex flex-col items-center text-center space-y-2 w-full">
            {/* Primary Result Section */}
            <div className="flex flex-col items-center">
                <span className="text-xs font-black text-indigo-400/60 uppercase tracking-[0.2em] mb-1">
                    Converted Total
                </span>
                <div className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                    {/* UTIL: Standardized currency formatting for premium look */}
                    {formatCurrency(data.convertedAmount, data.to)}
                </div>
            </div>

            {/* Secondary Details Section */}
            <div className="flex flex-col items-center pt-1">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-sm font-medium">
                    <span>1 {data.from} = {data.rate.toFixed(4)} {data.to}</span>
                </div>
                <span className="text-[11px] font-medium text-gray-500/60 uppercase tracking-wider pt-2">
                    LAST UPDATE: {formatDate(data.date)}
                </span>
            </div>
        </div>
    );
});

export default ExchangeResult;
