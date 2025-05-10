import {NextResponse} from "next/server";
import {add_insurance_data} from "@/app/services/alvi_ai/add_insurance_data";
import {log_interaction} from "@/app/services/alvi_ai/log_interaction";

export async function POST(request: Request): Promise<NextResponse> {
    try {

        // 1) Parse the body as JSON
        const requestBody: any = await request.json();
        console.log(requestBody);
        const patientId: string = requestBody.patientId;
        const patientInsuranceData = requestBody.patientInsuranceData as {
            first_name: string,
            last_name: string,
            dob: string,
            address: object,
            insurance: object
        };
        console.log(patientInsuranceData);
        console.log(patientId);

        // 2) Check that both keys exist and contain info, if not throw error
        if (!patientId || !patientInsuranceData) {
            throw new Error("Invalid request body. Must contain patientId and patientData.");
        }

        // 3) Process the data
        const supabase_response: any = await add_insurance_data(
            patientId,
            patientInsuranceData["first_name"],
            patientInsuranceData["last_name"],
            patientInsuranceData["dob"],
            patientInsuranceData["address"],
            patientInsuranceData["insurance"]
        )

        // Log interaction (non-blocking)
        log_interaction(
            patientId,
            "INSURANCE CARD SCANNED",
            "USER",
            patientInsuranceData["first_name"] + " has scanned their insurance card. He is insured with: " + JSON.stringify(patientInsuranceData["insurance"])
        );

        return NextResponse.json({message: "Insurance Data stored", patient: supabase_response});
    } catch (err: any) {
        return NextResponse.json({error: err.message || "Invalid JSON"}, {status: 400});
    }
}
