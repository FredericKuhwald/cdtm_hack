import {NextResponse} from 'next/server';
import {create_file} from "@/app/services/supabase/supabase";
import {classify_file_type} from "@/app/services/alvi_ai/classify_file_type";

// Allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export async function POST(request: Request): Promise<NextResponse> {
    try {
        console.log(request);
        // Get the form data from the request
        const formData = await request.formData();
        const file = formData.get('image') as File;
        const patientId = formData.get('patientId') as string;

        console.log(formData);

        if (!file) {
            return NextResponse.json(
                {error: 'No file provided'},
                {status: 400}
            );
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return NextResponse.json(
                {error: 'Invalid file type. Only JPEG, PNG and PDF are allowed'},
                {status: 400}
            );
        }

        // Convert file to base64
        const bytes: ArrayBuffer = await file.arrayBuffer();
        const buffer: Buffer<ArrayBuffer> = Buffer.from(bytes);

        // Define filename: Current timestamp (seconds) + file name
        const timestamp: number = Math.floor(Date.now() / 1000);
        const fileName: string = `${timestamp}_${file.name}`;

        // Upload to Blob storage + create a new entry in documents table
        const file_response: any = await create_file(fileName, buffer, patientId);

        // Classify the file
        const file_classification: any = await classify_file_type(fileName, file_response.id);

        // For now, we'll just return a success response
        return NextResponse.json({
            success: true,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
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
