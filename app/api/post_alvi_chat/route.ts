import {NextResponse} from 'next/server';
import {talk_to_alvi} from "@/app/services/alvi_ai/talk_to_alvi"

export async function POST(request: Request): Promise<NextResponse> {

    // Get the form data from the request
    const requestBody: any = await request.json();
    const patientId: string = requestBody.patientId;
    const conversationState: string = requestBody.conversationState;

    console.log("requestBody:", requestBody);

    // Generate the introduction message
    const alvi_message = await talk_to_alvi(
        patientId,
        conversationState
    ) as { message: string }

    // Return the environment variable in a JSON response
    return NextResponse.json({
        alvi_message: alvi_message.message,
    });
}