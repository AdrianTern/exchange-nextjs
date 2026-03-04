import { NextResponse } from 'next/server';
import { robustFetch } from '@/utils/fetcher';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || 'USD';
    const to = searchParams.get('to') || 'EUR';
    const startTime = Date.now();

    try {
        // Direct upstream call - force-dynamic on this route already prevents caching
        await robustFetch(`/latest?from=${from}&to=${to}`, { timeout: 5000 });

        const latency = Date.now() - startTime;

        // Define tiers based on latency
        let status = 'UP';
        if (latency > 5000) {
            status = 'SLOW'; // > 5 seconds is arguably slow for a simple ping
        }

        return NextResponse.json({
            status,
            latency,
            message: status === 'SLOW' ? 'Upstream API is experiencing high latency' : 'System Operational'
        });
    } catch (error: unknown) {
        console.error('Health Check Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            status: 'DOWN',
            message: 'Upstream API is unreachable or timed out',
            error: message
        }, { status: 503 });
    }
}
