import { NextResponse } from 'next/server';

// Allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export async function POST(request: Request): Promise<NextResponse> {
    try {
        // Get the form data from the request
        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG and PDF are allowed' },
                { status: 400 }
            );
        }

        // Convert file to base64
        const bytes: ArrayBuffer = await file.arrayBuffer();
        const buffer: Buffer<ArrayBuffer> = Buffer.from(bytes);
        const base64: string = buffer.toString('base64');

        // Here you would typically upload to Supabase
        // ToDo

        // For now, we'll just return a success response
        return NextResponse.json({
            success: true,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            message: 'File received successfully'
        });

    } catch (error) {
        console.error('Error processing file upload:', error);
        return NextResponse.json(
            { error: 'Error processing file upload' },
            { status: 500 }
        );
    }
}
