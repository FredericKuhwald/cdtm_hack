import {NextResponse} from "next/server";
import {add_insurance_data} from "@/app/services/alvi_ai/add_insurance_data";

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

        return NextResponse.json({message: "Insurance Data stored", patient: "data"});
    } catch (err: any) {
        return NextResponse.json({error: err.message || "Invalid JSON"}, {status: 400});
    }
}
