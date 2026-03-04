import React, { memo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TrendDirection } from '@/types/exchange';

interface TrendBadgeProps {
    trend: TrendDirection; // 'UP' | 'DOWN' | 'STABLE'
}

/**
 * A reusable visual indicator for market trends.
 * 
 * DESIGN PATTERN: Pure Component
 * This is a "Pure Component" because it has no internal state and its output 
 * is entirely dependent on its props.
 */
const TrendBadge = memo(function TrendBadge({ trend }: TrendBadgeProps) {
    if (trend === 'UP') {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                <TrendingUp className="w-3 h-3" />
                UP
            </span>
        );
    }

    if (trend === 'DOWN') {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                <TrendingDown className="w-3 h-3" />
                DOWN
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
            <Minus className="w-3 h-3" />
            STABLE
        </span>
    );
});

export default TrendBadge;
