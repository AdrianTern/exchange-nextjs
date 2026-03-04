import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * API Route: GET /api/location
 * 
 * Provides rough geolocation data based on IP address.
 * Uses freeipapi.com for high reliability in regional detection (especially for MYR/Malaysia).
 */
export async function GET() {
    try {
        const response = await fetch('https://freeipapi.com/api/json', {
            next: { revalidate: 3600 } // Cache results for 1 hour
        });

        if (!response.ok) {
            throw new Error('Failed to fetch location data from FreeIPAPI');
        }

        const data = await response.json();

        // Log results for debugging in dev mode
        if (process.env.NODE_ENV === 'development') {
            console.log('Location API (FreeIPAPI) Response:', data);
        }

        return NextResponse.json({
            country: data.countryName,
            currency: data.currencyCode,
            countryCode: data.countryCode
        });
    } catch (error) {
        console.error('Location API Error:', error);
        return NextResponse.json(
            { currency: 'USD', message: 'Fallback to default', error: error instanceof Error ? error.message : String(error) },
            { status: 200 }
        );
    }
}
