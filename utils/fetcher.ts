/**
 * Simplified fetch utility with a strict timeout.
 * Replaces the complex mirror/retry logic with a lean, transparent approach.
 */

const PRIMARY_API = 'https://api.frankfurter.app';

interface FetchOptions {
    timeout?: number;
}

/**
 * Performs a simple fetch with a strict timeout.
 */
export async function robustFetch(path: string, options: FetchOptions = {}) {
    const { timeout = 10000 } = options; // Default 10s timeout

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const url = `${PRIMARY_API}${path.startsWith('/') ? '' : '/'}${path}`;

        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error body');
            throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
        }

        const data = await response.json();
        if (!data) throw new Error('Empty response body');

        return data;
    } catch (err: any) {
        clearTimeout(timeoutId);

        if (err.name === 'AbortError') {
            throw new Error(`Request timed out after ${timeout}ms`);
        }

        throw err;
    }
}
