'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import ExchangeCard from '@/components/ExchangeCard';
import TrendGraph from '@/components/TrendGraph';
import AlertSettingsCard from '@/components/AlertSettingsCard';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCcw } from 'lucide-react';

export default function Home() {
  const queryClient = useQueryClient();

  // 1. PERSISTENT STATE: Sync inputs with localStorage to survive refreshes.
  const [from, setFrom, fromLoaded] = useLocalStorage('exchange:from', 'USD');
  const [to, setTo, toLoaded] = useLocalStorage('exchange:to', 'EUR');
  const [amount, setAmount, amountLoaded] = useLocalStorage<number>('exchange:amount', 1000);

  // ONE-TIME MIGRATION: Move old un-namespaced keys to the new 'exchange:' namespace.
  // Runs once on first load for users who had the old keys stored.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const migrations: [string, string][] = [
      ['from-currency', 'exchange:from'],
      ['to-currency', 'exchange:to'],
      ['exchange-amount', 'exchange:amount'],
      ['location-detected', 'exchange:detected'],
    ];
    migrations.forEach(([oldKey, newKey]) => {
      const oldValue = localStorage.getItem(oldKey);
      if (oldValue !== null && localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, oldValue);
      }
      localStorage.removeItem(oldKey);
    });
  }, []);

  // DEBOUNCED HEALTH KEY: Wait 800ms after the user stops changing currencies before
  // firing a new health check. Prevents a burst of upstream pings on rapid currency switches.
  const [debouncedFrom, setDebouncedFrom] = useState(from);
  const [debouncedTo, setDebouncedTo] = useState(to);
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedFrom(from); setDebouncedTo(to); }, 800);
    return () => clearTimeout(timer);
  }, [from, to]);

  // 2. SERVER STATE: Fetch the list of all supported currencies.
  const { data: currencies = {} } = useQuery<Record<string, string>>({
    queryKey: ['currencies'],
    queryFn: async () => {
      const res = await fetch('/api/currencies');
      if (!res.ok) throw new Error('Failed to load currencies');
      return res.json();
    },
    staleTime: 1000 * 60 * 60,
  });

  // 3. SMART DEFAULT: Detect user's local currency if no preference is stored.
  useEffect(() => {
    if (!fromLoaded || !hasCurrencies) return;

    const alreadyDetected = typeof window !== 'undefined' ? localStorage.getItem('exchange:detected') : 'true';

    if (alreadyDetected !== 'true') {
      console.log('[System] Running Smart Default Detection...');
      fetch('/api/location')
        .then(res => res.json())
        .then(data => {
          if (data.currency && currencies[data.currency]) {
            setFrom(data.currency);
            localStorage.setItem('exchange:detected', 'true');
            if (data.currency === to) {
              setTo(data.currency === 'USD' ? 'EUR' : 'USD');
            }
          } else {
            localStorage.setItem('exchange:detected', 'true');
          }
        })
        .catch(err => console.error('[System] Smart Default Detection failed:', err));
    }
  }, [fromLoaded, currencies, setFrom, to, setTo]);

  // 4. DYNAMIC STATUS: Check if the system is online by pinging the health endpoint.
  // queryKey includes from/to so the check re-runs when the user changes currencies.
  const { data: healthData, isFetching: isCheckingHealth, refetch: refetchHealth } = useQuery({
    queryKey: ['system-health', debouncedFrom, debouncedTo],
    queryFn: async () => {
      // Cache-bust via timestamp on our own endpoint only, not the upstream URL
      const res = await fetch(`/api/health?from=${debouncedFrom}&to=${debouncedTo}&t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) {
        try { return await res.json(); }
        catch { return { status: 'DOWN' }; }
      }
      return res.json();
    },
    // Stop auto-polling when already offline — user must click Retry to recover
    refetchInterval: (query: any) => (query.state.data?.status === 'DOWN' ? false : 30000),
  });

  // 5. GLOBAL TIMEOUT LISTENER: If any query (conversion, trend, etc.) times out,
  // we immediately trigger a health check to force the system into offline mode.
  // A ref guard prevents duplicate refetches if multiple queries timeout simultaneously.
  const timeoutRefetchPending = useRef(false);
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.action.type === 'error') {
        const error = event.action.error as any;
        if (error?.message?.toLowerCase().includes('timed out') && !timeoutRefetchPending.current) {
          timeoutRefetchPending.current = true;
          console.warn('[System] Global Timeout detected. Verifying system health...');
          // Small delay to batch any near-simultaneous timeout events
          setTimeout(() => {
            refetchHealth();
            timeoutRefetchPending.current = false;
          }, 100);
        }
      }
    });
    return () => unsubscribe();
  }, [queryClient, refetchHealth]);

  // While the first fetch is in flight, show neither skeleton nor live data — let
  // components handle their own initial loading state rather than showing a false "Offline".
  const systemStatus = healthData?.status ?? (isCheckingHealth ? 'PENDING' : 'DOWN');
  const isOnline = systemStatus === 'UP';
  const isSlow = systemStatus === 'SLOW';
  const isOffline = systemStatus === 'DOWN';
  // Memoized so Object.keys() only runs when the currencies object reference changes
  const hasCurrencies = useMemo(() => Object.keys(currencies).length > 0, [currencies]);

  return (
    <main className="min-h-screen relative py-12 px-4 md:px-8 space-y-12 overflow-hidden text-white">
      {/* Background Decorative Orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] rounded-full bg-brand-primary/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-brand-accent/10 blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-5xl mx-auto text-center animate-float">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border group cursor-default transition-all duration-500 ${isOnline ? 'bg-brand-success/10 border-brand-success/20' :
            isSlow ? 'bg-amber-500/10 border-amber-500/20' :
              'bg-brand-error/10 border-brand-error/20'
            }`}>
            <div className="relative flex h-2 w-2">
              {(isOnline || isSlow) && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-brand-success' : 'bg-amber-500'}`}></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-brand-success' : isSlow ? 'bg-amber-500' : 'bg-brand-error'}`}></span>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-brand-success' : isSlow ? 'text-amber-500' : 'text-brand-error'}`}>
              System {isOnline ? 'Online' : isSlow ? 'Slow' : 'Offline'}
            </span>
          </div>

          {(isOffline || isSlow) && (
            <button
              onClick={async () => {
                // We add a tiny delay before re-fetching so the user can actually see
                // the "Retrying..." state and the skeletons pulsing.
                await new Promise(resolve => setTimeout(resolve, 800));
                refetchHealth();
              }}
              disabled={isCheckingHealth}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCcw className={`w-3 h-3 ${isCheckingHealth ? 'animate-spin' : ''}`} />
              {isCheckingHealth ? 'Retrying...' : 'Retry Connection'}
            </button>
          )}
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 animate-shine">
          EXCHANGE
        </h1>
        <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto font-medium">
          Currency intelligence for the <span className="text-white font-bold italic">modern</span> economy.
        </p>
      </header>

      {/* Main Dashboard */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-8 pb-20">
        <section>
          <ExchangeCard
            from={from} setFrom={setFrom} fromLoaded={fromLoaded}
            to={to} setTo={setTo} toLoaded={toLoaded}
            amount={amount} setAmount={setAmount} amountLoaded={amountLoaded}
            currencies={currencies}
            isLoading={isOffline}
            isRetrying={isCheckingHealth}
          />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TrendGraph from={from} to={to} isLoading={isOffline} isRetrying={isCheckingHealth} />
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <AlertSettingsCard
              from={from}
              to={to}
              isLoading={isOffline || !hasCurrencies}
              isRetrying={isCheckingHealth}
            />
          </div>
        </div>
      </div>

      <footer className="relative z-10 max-w-7xl mx-auto border-t border-white/5 pt-12 text-center text-gray-600 text-xs pb-12">
        <p>&copy; 2026 Exchange &bull; Adrian Tern &bull; All rights reserved. </p>
      </footer>
    </main>
  );
}
