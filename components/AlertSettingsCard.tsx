'use client';

import React, { useState, useEffect, memo } from 'react';
import { Bell, BellOff, ArrowUp, ArrowDown } from 'lucide-react';
import { useRateAlert } from '@/hooks/useRateAlert';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AlertSettingsCardProps {
    from: string; // Base currency to monitor
    to: string; // Target currency to monitor
    isLoading?: boolean; // Loading state passed from parent
    isRetrying?: boolean;
}

/**
 * Data structure for the user's alert configuration.
 */
interface AlertConfig {
    targetRate: number; // The exchange rate threshold
    direction: 'ABOVE' | 'BELOW'; // Whether to alert when rate exceeds or falls below
    enabled: boolean; // Toggle for the alert system
}

/**
 * UI for configuring and managing real-time currency rate alerts.
 * 
 * DESIGN PATTERN: Persistence Container
 * This component manages its own persistence via `useLocalStorage`, 
 * ensuring that user-defined alert thresholds survive page refreshes.
 * 
 * PERFORMANCE OPTIMIZATION: React.memo
 */
const AlertSettingsCard = memo(function AlertSettingsCard({ from, to, isLoading, isRetrying }: AlertSettingsCardProps) {
    // PERSISTENCE: Alert config is keyed by the currency pair to allow different alerts per pair.
    const [config, setConfig] = useLocalStorage<AlertConfig>(`exchange:alert:${from}:${to}`, {
        targetRate: 0,
        direction: 'ABOVE',
        enabled: false,
    });

    // DRAFT STATE: Temporary state for user input before "committing" to the alert tracker.
    const [targetInput, setTargetInput] = useState<string>(
        config.targetRate > 0 ? config.targetRate.toString() : ''
    );
    const [draftDirection, setDraftDirection] = useState<'ABOVE' | 'BELOW'>(config.direction);

    // Synchronize draft state when config changes
    useEffect(() => {
        setTargetInput(config.targetRate > 0 ? config.targetRate.toString() : '');
        setDraftDirection(config.direction);
    }, [config.targetRate, config.direction]);

    // Active monitoring hook (only runs if enabled AND system is NOT loading/offline)
    useRateAlert(from, to, config.targetRate, config.direction, config.enabled && !isLoading);

    /**
     * Commits the draft settings to the permanent alert configuration.
     */
    const handleToggle = () => {
        const rate = parseFloat(targetInput);
        if (!config.enabled && (isNaN(rate) || rate <= 0)) return;

        setConfig({
            targetRate: rate || config.targetRate,
            direction: draftDirection,
            enabled: !config.enabled,
        });
    };

    if (isLoading) {
        return (
            <div className={`glass-panel p-6 space-y-6 h-full flex flex-col ${isRetrying ? 'animate-pulse' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                    <div className="h-4 bg-white/5 rounded-lg w-24"></div>
                    <div className="h-4 bg-white/5 rounded-full w-12"></div>
                </div>
                <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-12 bg-white/5 rounded-xl"></div>
                        <div className="h-12 bg-white/5 rounded-xl"></div>
                    </div>
                    <div className="h-12 bg-white/5 rounded-xl"></div>
                </div>
                <div className="h-14 bg-white/10 rounded-xl mt-auto"></div>
            </div>
        );
    }

    return (
        <div className="glass-panel p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Rate Alerts
                </h3>
                {config.enabled ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full uppercase">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Active
                    </span>
                ) : (
                    <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full uppercase">
                        Inactive
                    </span>
                )}
            </div>

            <div className="space-y-5 flex-1 flex flex-col">
                {/* 1. Direction Selection (DRAFT ONLY) */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setDraftDirection('ABOVE')}
                        disabled={config.enabled}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${draftDirection === 'ABOVE'
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                            } disabled:opacity-50`}
                    >
                        <ArrowUp className="w-4 h-4" />
                        <span className="text-xs font-bold">ABOVE</span>
                    </button>
                    <button
                        onClick={() => setDraftDirection('BELOW')}
                        disabled={config.enabled}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${draftDirection === 'BELOW'
                            ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                            } disabled:opacity-50`}
                    >
                        <ArrowDown className="w-4 h-4" />
                        <span className="text-xs font-bold">BELOW</span>
                    </button>
                </div>

                {/* 2. Rate Input (DRAFT ONLY) */}
                <div className="relative">
                    <input
                        type="number"
                        step="0.0001"
                        placeholder="Enter target rate..."
                        value={targetInput}
                        onChange={(e) => setTargetInput(e.target.value)}
                        disabled={config.enabled}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 uppercase">
                        {to}
                    </div>
                </div>

                {/* 3. Action Button (COMMIT TO LOCALSTORAGE) */}
                <div className="mt-auto pt-4">
                    <button
                        onClick={handleToggle}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${config.enabled
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'
                            }`}
                    >
                        {config.enabled ? (
                            <>
                                <BellOff className="w-4 h-4" />
                                Stop Tracking
                            </>
                        ) : (
                            <>
                                <Bell className="w-4 h-4" />
                                Start Alert Tracker
                            </>
                        )}
                    </button>
                </div>

                {config.enabled && (
                    <p className="text-[10px] text-center text-gray-500 px-4 leading-relaxed">
                        We&apos;ll notify you when 1 {from} goes {config.direction.toLowerCase()} {config.targetRate} {to}.
                        <br />Checking for updates every 30 seconds.
                    </p>
                )}
            </div>
        </div>
    );
});

export default AlertSettingsCard;
