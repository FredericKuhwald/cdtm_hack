import { NextResponse } from "next/server";


export async function POST(request: Request): Promise<NextResponse> {
    try {

        // 1) Parse the body as JSON
        const requestBody: any = await request.json();
        const patientId: string = requestBody.patientId;
        const patientData: object = requestBody.patientData;

        // 2) Check that both keys exist and contain info, if not throw error


        // 2) Store the data

        return NextResponse.json({ message: "Patient created", patient: "data" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Invalid JSON" }, { status: 400 });
    }
}
