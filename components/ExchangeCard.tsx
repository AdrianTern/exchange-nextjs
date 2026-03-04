'use client';

import React, { useState, useEffect, memo } from 'react';
import { ArrowLeftRight, RefreshCcw } from 'lucide-react';
import CurrencySelector from './CurrencySelector';
import ExchangeResult from './ExchangeResult';
import { useConversion } from '@/hooks/useConversion';

interface ExchangeCardProps {
    from: string;
    setFrom: (value: string) => void;
    fromLoaded: boolean;
    to: string;
    setTo: (value: string) => void;
    toLoaded: boolean;
    amount: number;
    setAmount: (value: number) => void;
    amountLoaded: boolean;
    currencies: Record<string, string>;
    isLoading?: boolean;
    isRetrying?: boolean;
}

/**
 * The primary dashboard component for currency exchange.
 * 
 * DESIGN PATTERN: Higher-Order Orchestrator (Props-Driven)
 * This component is now a "Controlled Component" that receives its state from 
 * the parent Home component.
 */
const ExchangeCard = memo(function ExchangeCard({
    from, setFrom, fromLoaded,
    to, setTo, toLoaded,
    amount, setAmount, amountLoaded,
    currencies,
    isLoading: forceLoading,
    isRetrying
}: ExchangeCardProps) {
    // 1. HYDRATION GUARD: Ensures we don't show default values before localStorage is ready.
    // Also forces loading if the parent specifies (e.g., system is offline).
    const isHydrated = fromLoaded && toLoaded && amountLoaded && !forceLoading;
    const [debouncedAmount, setDebouncedAmount] = useState<number>(amount);

    // 2. DEBOUNCE EFFECT: Wait 500ms after the last typing event before updating the "real" amount.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedAmount(amount);
        }, 500);
        return () => clearTimeout(timer);
    }, [amount]);

    // 3. SERVER STATE: Fetch the actual conversion rate based on current inputs.
    const {
        data: conversion,
        isLoading: isConverting,
        error,
        refetch,
    } = useConversion(from, to, debouncedAmount, { enabled: !forceLoading });

    /**
     * Swaps the 'from' and 'to' currencies.
     */
    const swapCurrencies = () => {
        const temp = from;
        setFrom(to);
        setTo(temp);
    };

    return (
        <div className="glass-panel p-5 md:p-8 relative overflow-hidden group">
            {/* Design Detail: Subtle background glow that reacts to hover */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-indigo-600/20" />

            <div className="relative z-10 space-y-8">
                {!isHydrated ? (
                    /* SKELETON STATE: Prevents Layout Shift and stale interactions */
                    <div className={`space-y-8 ${isRetrying ? 'animate-pulse' : ''}`}>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-full md:flex-1 space-y-3">
                                <div className="h-3 bg-white/5 rounded w-24 ml-1"></div>
                                <div className="h-[72px] bg-white/5 rounded-2xl w-full"></div>
                            </div>
                            <div className="flex flex-col md:flex-row md:flex-[2] w-full items-center md:items-end gap-3">
                                <div className="w-full md:flex-1 h-[52px] bg-white/5 rounded-xl"></div>
                                <div className="w-12 h-12 rounded-full bg-white/5 shrink-0"></div>
                                <div className="w-full md:flex-1 h-[52px] bg-white/5 rounded-xl"></div>
                            </div>
                        </div>
                        {/* Skeleton for the Results Area */}
                        <div className="pt-8 border-t border-white/5 flex justify-center">
                            <div className="h-24 bg-white/5 rounded-3xl w-full max-w-md"></div>
                        </div>
                    </div>
                ) : (
                    /* ACTIVE UI STATE */
                    <>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Amount Input Section */}
                            <div className="w-full md:flex-1 relative">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">
                                    Transaction Amount
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="any"
                                        value={amount || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '') {
                                                setAmount(0);
                                            } else {
                                                const parsed = parseFloat(val);
                                                if (!isNaN(parsed)) {
                                                    setAmount(parsed);
                                                }
                                            }
                                        }}
                                        placeholder="0.00"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-3xl md:text-2xl lg:text-3xl font-black text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-700 shadow-2xl"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                        <span className="text-xl font-black text-gray-500/20">{from}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Currency Selectors Section */}
                            <div className="flex flex-col md:flex-row md:flex-[2] w-full items-center md:items-end gap-4 md:gap-3">
                                <div className="w-full md:flex-1">
                                    <CurrencySelector
                                        label="From"
                                        value={from}
                                        onChange={setFrom}
                                        currencies={currencies}
                                    />
                                </div>

                                <button
                                    onClick={swapCurrencies}
                                    className="p-3 rounded-full bg-white/5 border border-white/10 text-indigo-400 hover:bg-white/10 hover:scale-110 active:scale-95 transition-all duration-200 rotate-90 md:rotate-0"
                                    title="Swap Currencies"
                                >
                                    <ArrowLeftRight className="w-5 h-5" />
                                </button>

                                <div className="w-full md:flex-1">
                                    <CurrencySelector
                                        label="To"
                                        value={to}
                                        onChange={setTo}
                                        currencies={currencies}
                                        align="right"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer / Results Section */}
                        <div className="pt-8 border-t border-white/5 flex flex-col items-center justify-center relative min-h-[100px] gap-6">
                            <div className="w-full max-w-md">
                                <ExchangeResult
                                    data={conversion}
                                    // Loading if: converting OR fetching currencies OR user is still typing (debounce)
                                    isLoading={isConverting || Object.keys(currencies).length === 0 || amount !== debouncedAmount}
                                />
                            </div>

                            {error && !isRetrying && (
                                <div className="md:absolute md:right-0">
                                    <button
                                        onClick={() => refetch()}
                                        className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 rounded-2xl font-bold text-sm hover:bg-red-500/20 transition-all"
                                    >
                                        <RefreshCcw className="w-4 h-4" />
                                        Retry Fetch
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});

export default ExchangeCard;
