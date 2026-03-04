'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing state synchronized with window.localStorage.
 *
 * DESIGN PATTERN: Persistence Layer / Data Synchronization
 * This hook acts as a bridge between React's reactive state and the browser's persistent storage.
 *
 * @template T The type of the value being stored.
 * @param {string} key Unique key for localStorage.
 * @param {T} defaultValue Initial value if no data exists in storage.
 * @returns {[T, (value: T) => void, boolean]} [state, setter, isLoaded]
 *
 * HYDRATION NOTE:
 * In Next.js/SSR environments, we can't access localStorage on the server.
 * The `isLoaded` flag tells the UI when the client-side data is ready,
 * which is critical for preventing "Layout Shift" or "Hydration Mismatch" errors.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void, boolean] {
    // 1. Initialize state with the default value (used during SSR and initial mount)
    const [state, setState] = useState<T>(defaultValue);

    // 2. Track if we've successfully read from localStorage ( hydration flag)
    const [isLoaded, setIsLoaded] = useState(false);

    // 3. EFFECT: Run only on the client after the component mounts
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                // If data exists, parse and update state
                setState(JSON.parse(item));
            }
        } catch (error) {
            console.error('Error reading localStorage', error);
        } finally {
            // Signal that we've finished the attempt to load from storage
            setIsLoaded(true);
        }
    }, [key]);

    /**
     * Updates both the React state and the persistent localStorage.
     */
    // STABLE REFERENCE: useCallback ensures the setter identity is preserved across renders,
    // so React.memo on child components that receive this setter is not silently bypassed.
    const setValue = useCallback((value: T) => {
        try {
            setState(value);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.error('Error setting localStorage', error);
        }
    }, [key]);

    return [state, setValue, isLoaded];
}
