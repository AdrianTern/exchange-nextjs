import { NextRequest, NextResponse } from 'next/server';
import { apiCache } from '@/utils/cache';
import { robustFetch } from '@/utils/fetcher';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const amountStr = searchParams.get('amount') || '0';
    const amount = parseFloat(amountStr);

    if (!from || !to) {
        return NextResponse.json(
            { message: 'Missing from or to currency' },
            { status: 400 }
        );
    }

    if (from === to) {
        return NextResponse.json({
            from,
            to,
            amount,
            rate: 1,
            convertedAmount: amount,
            date: new Date().toISOString().split('T')[0],
        });
    }

    const cacheKey = `convert_${from}_${to}_${amountStr}`;
    const cachedData = apiCache.get<{ from: string; to: string; amount: number; rate: number; convertedAmount: number; date: string }>(cacheKey);

    if (cachedData) {
        console.log(`[Cache] Serving conversion ${from}->${to} from cache`);
        return NextResponse.json(cachedData);
    }

    try {
        const data = await robustFetch(`/latest?from=${from}&to=${to}`);

        const rate = data.rates[to];
        const convertedAmount = Math.round(amount * rate * 100) / 100;

        const result = {
            from,
            to,
            amount,
            rate,
            convertedAmount,
            date: data.date,
        };

        // Cache for 5 minutes (300 seconds)
        apiCache.set(cacheKey, result, 300);

        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error('Convert API Error:', error);
        return NextResponse.json(
            { message: 'Failed to perform currency conversion' },
            { status: 500 }
        );
    }
}
