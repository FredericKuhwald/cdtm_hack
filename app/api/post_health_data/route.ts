import {NextResponse} from "next/server";
import {add_wearable_data} from "@/app/services/alvi_ai/add_wearable_data";
import {log_interaction} from "@/app/services/alvi_ai/log_interaction";


export async function POST(request: Request): Promise<NextResponse> {
    try {

        // 1) Parse the body as JSON
        const requestBody: any = await request.json();
        const patientId: string = requestBody.patientId;
        const patientWearableData: object = requestBody.patientData;

        // 2) Check that both keys exist and contain info, if not throw error
        if (!patientId || !patientWearableData) {
            throw new Error("Invalid request body. Must contain patientId and patientWearableData.");
        }

        // 3) Process the data
        const supabase_response: any = await add_wearable_data(
            patientId,
            patientWearableData
        )

        // Log interaction (non-blocking)
        log_interaction(
            patientId,
            "APPLE HEALTH DATA UPLOADED",
            "USER",
            "The User has uploaded Apple Health Hearth Rate Measurements for the past 24 hours. The data looks normal."
        );

        return NextResponse.json({message: "Wearable Data stored", patient: supabase_response});
    } catch (err: any) {
        return NextResponse.json({error: err.message || "Invalid JSON"}, {status: 400});
    }
}
