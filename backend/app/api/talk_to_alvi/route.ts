import {NextResponse} from 'next/server';
import {talk_to_alvi} from "@/app/services/alvi_ai/talk_to_alvi"
import {classify_file_type} from "@/app/services/alvi_ai/classify_file_type";
import {get_table, read_file_as_base64, get_row_by_id} from "@/app/services/supabase/supabase";

export async function GET(request: Request): Promise<NextResponse> {

    // Log the metering
    // Extract headers for logging
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ipAddress =
        request.headers.get('x-forwarded-for') || // If behind a proxy (e.g., Vercel)
        request.headers.get('x-real-ip') || // Alternative header
        'Unknown'; // Fallback if neither is available

    // Generate the introduction message
    const alvi_introduction = await talk_to_alvi() as { message: string }

    // Load the file_row
    const row_entry: any = await get_row_by_id("test_table_fk", 1)
    const file_name_path: string = row_entry["file_name"]

    // Load the file data
    const file_content: {
        file_name: string,
        file_mime_type: string,
        file_base64: string
    } = await read_file_as_base64(file_name_path);

    // Classify the file type
    const file_classification_response: object = await classify_file_type(file_name_path, 1)

    const table_content: any[] = await get_table("test_table_fk");


    // Return the environment variable in a JSON response
    return NextResponse.json({
        endpoint: '/api/talk_to_alvi',
        alvi_message: alvi_introduction,
        row_entry: row_entry,
        file_classification_response: file_classification_response,
        table_content: table_content,
        file_content: {file_name: file_content.file_name, file_type: file_content.file_mime_type},
        user: userAgent + " from IP: " + ipAddress,
    });
}