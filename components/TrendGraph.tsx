'use client';

import React, { memo, useMemo } from 'react';
import { useComparison } from '@/hooks/useComparison';
import { formatPercentage } from '@/utils/formatters';
import TrendBadge from './TrendBadge';

interface TrendGraphProps {
    from: string;
    to: string;
    isLoading?: boolean;
    isRetrying?: boolean;
}

/**
 * A premium SVG-based sparkline graph showing 7-day currency trends.
 * 
 * DESIGN PATTERN: Data Visualization / Path Generation
 * We calculate SVG path points dynamically based on the historical rate values,
 * normalizing them to fit a fixed coordinate system.
 * 
 * PERFORMANCE OPTIMIZATION: React.memo
 */
const TrendGraph = memo(function TrendGraph({ from, to, isLoading: forceLoading, isRetrying }: TrendGraphProps) {
    const { data, isLoading: queryLoading, error, refetch } = useComparison(from, to, { enabled: !forceLoading });

    // RULES OF HOOKS: useMemo must be called unconditionally before any early returns.
    // We guard against null/missing data inside the memo itself and skip computation safely.
    const graphData = useMemo(() => {
        if (!data?.history || data.history.length < 2) return null;

        const rates = data.history.map(h => h.rate);
        const min = Math.min(...rates);
        const max = Math.max(...rates);
        const range = max - min || 1;

        const width = 300;
        const height = 100;
        const padding = 10;

        const points = rates.map((rate, i) => {
            const x = (i / (rates.length - 1)) * (width - padding * 2) + padding;
            const y = height - ((rate - min) / range) * (height - padding * 2) - padding;
            return `${x},${y}`;
        });

        const pathData = `M ${points.join(' L ')}`;
        const areaData = `${pathData} L ${width - padding},${height} L ${padding},${height} Z`;

        const minIndex = rates.indexOf(min);
        const maxIndex = rates.indexOf(max);
        const [minX, minY] = points[minIndex].split(',').map(Number);
        const [maxX, maxY] = points[maxIndex].split(',').map(Number);

        return { rates, min, max, width, height, padding, points, pathData, areaData, minX, minY, maxX, maxY };
    }, [data]);

    // Early returns happen AFTER all hooks
    if (queryLoading || forceLoading) {
        return (
            <div className={`glass-panel p-6 space-y-4 h-full ${isRetrying ? 'animate-pulse' : ''}`}>
                <div className="h-4 bg-white/5 rounded w-1/3"></div>
                <div className="h-32 bg-white/5 rounded-xl w-full"></div>
                <div className="flex justify-between">
                    <div className="h-3 bg-white/5 rounded w-16"></div>
                    <div className="h-3 bg-white/5 rounded w-16"></div>
                </div>
            </div>
        );
    }

    if (error || !data || !graphData) {
        return (
            <div className="glass-panel p-6 text-center">
                <p className="text-red-400 text-sm mb-4">Failed to load trend data</p>
                <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs hover:bg-indigo-500/20 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const { min, max, width, height, points, pathData, areaData, minX, minY, maxX, maxY } = graphData;

    const isUp = data.percentageChange >= 0;
    const strokeColor = isUp ? '#4ade80' : '#f87171'; // green-400 : red-400

    return (
        <div className="glass-panel p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    7-Day Trend
                </h3>
            </div>

            {/* SVG Sparkline */}
            <div className="relative flex-1 min-h-[120px] group">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                >
                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <path
                        d={areaData}
                        fill="url(#graphGradient)"
                        className="transition-all duration-700 ease-in-out"
                    />

                    {/* Main stroke line */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-700 ease-in-out"
                    />

                    {/* Data points (circles) on hover */}
                    {points.map((p, i) => {
                        const [x, y] = p.split(',');
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="4"
                                fill={strokeColor}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            />
                        );
                    })}

                    {/* 2. PINPOINTS: High and Low markers (coordinates pre-computed in useMemo) */}
                    <g className="animate-in fade-in duration-1000">
                        <circle cx={maxX} cy={maxY} r={5} fill="#fff" className="shadow-lg" />
                        <circle cx={maxX} cy={maxY} r={3} fill="#4ade80" />
                        <text
                            x={maxX}
                            y={maxY - 12}
                            textAnchor="middle"
                            className="text-[10px] font-black fill-[#4ade80]"
                            style={{ filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.8))' }}
                        >
                            {max.toFixed(4)}
                        </text>
                    </g>

                    <g className="animate-in fade-in duration-1000 delay-300">
                        <circle cx={minX} cy={minY} r={5} fill="#fff" className="shadow-lg" />
                        <circle cx={minX} cy={minY} r={3} fill="#f87171" />
                        <text
                            x={minX}
                            y={minY + 18}
                            textAnchor="middle"
                            className="text-[10px] font-black fill-[#f87171]"
                            style={{ filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.8))' }}
                        >
                            {min.toFixed(4)}
                        </text>
                    </g>
                </svg>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between items-center mt-6 border-t border-white/5 pt-4">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Start</span>
                    <span className="text-xs text-white font-medium">{data.history[0].date}</span>
                </div>

                <div className="flex flex-col items-center">
                    <span className={`text-xs font-bold leading-none ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercentage(data.percentageChange)}
                    </span>
                    <div className="mt-1 scale-80 origin-center">
                        <TrendBadge trend={data.trend} />
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Current</span>
                    <span className="text-xs text-white font-medium font-mono">{data.currentRate.toFixed(4)}</span>
                </div>
            </div>
        </div>
    );
});

export default TrendGraph;
