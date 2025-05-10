import {NextResponse} from "next/server";
import {add_wearable_data} from "@/app/services/alvi_ai/add_wearable_data";


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

        return NextResponse.json({message: "Wearable Data stored", patient: supabase_response});
    } catch (err: any) {
        return NextResponse.json({error: err.message || "Invalid JSON"}, {status: 400});
    }
}
