'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import Image from 'next/image';
import { Search, ChevronDown } from 'lucide-react';
import { getFlagUrl } from '@/utils/currencyToCountry';

/**
 * Props for the CurrencySelector component.
 */
interface CurrencySelectorProps {
    value: string; // The currently selected currency code (e.g., "USD")
    onChange: (value: string) => void; // Callback fired when a new currency is selected
    currencies: Record<string, string>; // Dictionary of currency codes to full names
    label: string; // Accessible label for the selector
    align?: 'left' | 'right'; // Dropdown alignment relative to the trigger
}

/**
 * A premium currency selection component with search capabilities.
 * 
 * DESIGN PATTERN: Controlled Component
 * This component follows the "Controlled Component" pattern where its value is 
 * managed by the parent, ensuring a single source of truth.
 * 
 * PERFORMANCE OPTIMIZATION: React.memo
 * We wrap this in memo() because the `currencies` list can be large, and we want 
 * to skip re-renders unless the props (value, label, etc.) actually change.
 */
const CurrencySelector = memo(function CurrencySelector({
    value,
    onChange,
    currencies,
    label,
    align = 'left',
}: CurrencySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 1. COMPUTED STATE: Filter the currency list based on search input.
    // This is derived from the 'currencies' and 'search' state.
    const filteredCurrencies = Object.entries(currencies).filter(
        ([code, name]) =>
            code.toLowerCase().includes(search.toLowerCase()) ||
            name.toLowerCase().includes(search.toLowerCase())
    );

    // 2. DESIGN PATTERN: Click Outside Listener
    // A standard UX pattern to close dropdowns when a user clicks elsewhere.
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const flagUrl = getFlagUrl(value);

    return (
        <div className="relative flex-1" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                {label}
            </label>

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 glass-item hover:bg-white/20 transition-all duration-200 group"
            >
                <div className="flex items-center gap-3">
                    {flagUrl && (
                        <Image
                            src={flagUrl}
                            alt={`${value} flag`}
                            width={24}
                            height={16}
                            className="w-6 h-4 object-cover rounded shadow-sm"
                            unoptimized
                        />
                    )}
                    <span className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">
                        {value}
                    </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Selection Dropdown */}
            {isOpen && (
                <div className={`absolute z-50 mt-1 w-full bg-slate-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ${align === 'right' ? 'right-0' : 'left-0'}`}>
                    {/* Search Header */}
                    <div className="p-2 border-b border-white/10 bg-slate-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-slate-900 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* List Items */}
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredCurrencies.length > 0 ? (
                            filteredCurrencies.map(([code, name]) => {
                                const itemFlag = getFlagUrl(code);
                                return (
                                    <button
                                        key={code}
                                        onClick={() => {
                                            onChange(code); // Update parent state
                                            setIsOpen(false); // Close dropdown
                                            setSearch(''); // Clear search
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-none ${value === code ? 'bg-indigo-500/20 border-l-2 border-l-indigo-500' : 'border-l-2 border-l-transparent'
                                            }`}
                                    >
                                        <div className="shrink-0">
                                            {itemFlag ? (
                                                <Image
                                                    src={itemFlag}
                                                    alt={`${code} flag`}
                                                    width={24}
                                                    height={16}
                                                    className="w-6 h-4 object-cover rounded shadow-sm"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-6 h-4 bg-white/5 rounded border border-white/10 flex items-center justify-center text-[8px] text-gray-500 uppercase">
                                                    {code.slice(0, 2)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-white text-sm leading-tight">{code}</div>
                                            <div className="text-[10px] text-gray-400 truncate font-medium">{name}</div>
                                        </div>
                                        {value === code && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-4 py-6 text-center text-gray-500 text-xs">
                                No matches for &quot;{search}&quot;
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

export default CurrencySelector;
