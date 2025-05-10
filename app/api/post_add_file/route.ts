import {NextResponse} from 'next/server';
import {create_file} from "@/app/services/supabase/supabase";
import {classify_file_type} from "@/app/services/alvi_ai/classify_file_type";
import {log_interaction} from "@/app/services/alvi_ai/log_interaction";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        console.log(request);

        // Get the form data from the request
        const requestBody: any = await request.json();
        console.log("requestBody",requestBody);
        const patientId: string = requestBody.patientId;
        const file_data: { file_name: string, file_type: string, file_base64: string } = requestBody.file_data;

        // convert base64 to file buffer
        const buffer: Buffer = Buffer.from(file_data.file_base64, 'base64');


        // Define filename: Current timestamp (seconds) + file name
        const timestamp: number = Math.floor(Date.now() / 1000);
        const fileName: string = `${timestamp}_${file_data.file_name}`;

        // Upload to Blob storage + create a new entry in documents table
        const file_response: any = await create_file(fileName, buffer, patientId);

        // Classify the file
        const file_classification: any = await classify_file_type(fileName, file_response.id);

        // Log interaction (non-blocking)
        log_interaction(
            patientId,
            "FILE UPLOAD (" + file_data.file_type + ")",
            "USER",
            "FILE-CATEGORY:  " + file_classification.type + " FILE-CONTENT: " + file_classification.summary
        );

        // Trigger data extraction (non blocking)
        // trigger data extraction depending on file type


        // For now, we'll just return a success response
        return NextResponse.json({
            success: true,
            file_data: {file_name: file_data.file_name, file_type: file_data.file_type, file_base64: file_data.file_base64.substring(0, 50) + "..."},
            file_response: file_response,
            file_classification: file_classification,
            message: 'File received'
        });

    } catch (error) {
        console.error('Error processing file upload:', error);
        return NextResponse.json(
            {error: 'Error processing file upload'},
            {status: 500}
        );
    }
}
