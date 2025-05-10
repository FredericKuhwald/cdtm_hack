import {NextResponse} from 'next/server';
import {talk_to_alvi} from "@/app/services/alvi_ai/talk_to_alvi"
import {classify_file_type} from "@/app/services/alvi_ai/classify_file_type";
import {get_table, read_file_as_base64, get_row_by_id} from "@/app/services/supabase/supabase";
import { update_diagnoses } from '@/app/services/alvi_ai/update_diagnoses';

export async function GET(request: Request): Promise<NextResponse> {



    // Generate the introduction message
    const resp = await update_diagnoses("/1616.pdf", "6a53a6cb-86b8-41d1-bc28-84e8de22cd1d")


    // Return the environment variable in a JSON response
    return NextResponse.json({
        endpoint: '/api/sven_test',
        resp: resp,
    });
}
