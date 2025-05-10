import {NextResponse} from 'next/server';
import {talk_to_alvi} from "@/app/services/alvi_ai/talk_to_alvi"

export async function GET(request: Request): Promise<NextResponse> {

    // Log the metering
    // Extract headers for logging
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ipAddress =
        request.headers.get('x-forwarded-for') || // If behind a proxy (e.g., Vercel)
        request.headers.get('x-real-ip') || // Alternative header
        'Unknown'; // Fallback if neither is available

    // Generate the introduction message
    const alvi_introduction = await talk_to_alvi() as { message: string }

    // Return the environment variable in a JSON response
    return NextResponse.json({
        endpoint: '/api/get_talk_to_alvi',
        alvi_message: alvi_introduction,
        user: userAgent + " from IP: " + ipAddress,
    });
}