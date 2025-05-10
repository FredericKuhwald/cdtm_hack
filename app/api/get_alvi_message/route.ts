import {NextResponse} from 'next/server';
import {talk_to_alvi} from "@/app/services/alvi_ai/talk_to_alvi"
import {get_previous_logs_for_patient} from "@/app/services/supabase/supabase";


// ToDo: Convert this to a POST system so that the user can chat back
export async function GET(request: Request): Promise<NextResponse> {


    // extract conversation_state from request parameters
    // valid STATES: introduce, conversation, closing, goodbye
    // if null default to conversation
    const {searchParams} = new URL(request.url);
    let conversation_state: string = searchParams.get("conversation_state") || "conversation";
    const patientId: string = searchParams.get("patientId") || "blank";
    if (patientId === "blank") {
        return NextResponse.json({
            message: "Something went wrong... I don't know who you are... Please try again...",
        });
    }

    // get the current record of the patient


    // Generate the introduction message
    const alvi_introduction = await talk_to_alvi() as { message: string }

    // Return the environment variable in a JSON response
    return NextResponse.json({
        alvi_message: alvi_introduction,
    });
}