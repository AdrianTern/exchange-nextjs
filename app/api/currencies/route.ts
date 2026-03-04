import { NextResponse } from 'next/server';
import { apiCache } from '@/utils/cache';
import { robustFetch } from '@/utils/fetcher';

export const dynamic = 'force-dynamic';

export async function GET() {
    const cacheKey = 'currencies_list';
    const cachedData = apiCache.get<Record<string, string>>(cacheKey);

    if (cachedData) {
        console.log('[Cache] Serving currencies from cache');
        return NextResponse.json(cachedData);
    }

    try {
        const data = await robustFetch('/currencies');

        // Cache for 1 hour
        apiCache.set(cacheKey, data, 3600);

        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error('Currencies API Error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch currencies' },
            { status: 500 }
        );
    }
}
