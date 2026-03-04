import { NextRequest, NextResponse } from 'next/server';
import { getPastDate } from '@/utils/dateUtils';
import { apiCache } from '@/utils/cache';
import { robustFetch } from '@/utils/fetcher';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
        return NextResponse.json(
            { message: 'Missing from or to currency' },
            { status: 400 }
        );
    }

    const startDate = getPastDate(7); // Last 7 days
    const endDate = getPastDate(0);   // Today

    const cacheKey = `compare_${from}_${to}_${startDate}_${endDate}`;
    const cachedData = apiCache.get<any>(cacheKey);

    if (cachedData) {
        console.log(`[Cache] Serving trend ${from}->${to} from cache`);
        return NextResponse.json(cachedData);
    }

    try {
        // Fetch historical range using robust fetcher
        const data = await robustFetch(`/${startDate}..${endDate}?from=${from}&to=${to}`);

        // Transform Frankfurter rates object into a sorted array of historical rates
        const history = Object.entries(data.rates as Record<string, Record<string, number>>).map(([date, rates]) => ({
            date,
            rate: rates[to]
        })).sort((a, b) => a.date.localeCompare(b.date));

        if (history.length < 2) {
            throw new Error('Insufficient historical data');
        }

        const currentRate = history[history.length - 1].rate;
        const previousRate = history[0].rate; // 7 days ago or earliest available

        const absoluteChange = currentRate - previousRate;
        const percentageChange =
            Math.round((absoluteChange / previousRate) * 100 * 100) / 100;

        let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
        if (absoluteChange > 0) trend = 'UP';
        else if (absoluteChange < 0) trend = 'DOWN';

        const result = {
            from,
            to,
            currentRate,
            previousRate,
            absoluteChange,
            percentageChange,
            trend,
            date: data.end_date,
            history
        };

        // Cache for 5 minutes
        apiCache.set(cacheKey, result, 300);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Trend API Error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch trend data' },
            { status: 500 }
        );
    }
}
