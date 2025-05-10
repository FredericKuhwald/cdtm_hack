import {NextResponse} from 'next/server';
import {update_diagnoses} from '@/app/services/alvi_ai/update_diagnoses';
import {update_allergies} from '@/app/services/alvi_ai/update_allergies';
import { update_immunizations } from '@/app/services/alvi_ai/update_immunizations';

export async function GET(request: Request): Promise<NextResponse> {

    // run fx
    const diagnoses = await update_diagnoses("/1616.pdf", "6a53a6cb-86b8-41d1-bc28-84e8de22cd1d")
    const allergies = await update_allergies("/1616.pdf", "6a53a6cb-86b8-41d1-bc28-84e8de22cd1d")
    const immunizations = await update_immunizations("impfpass_2852.HEIC", "6a53a6cb-86b8-41d1-bc28-84e8de22cd1d")

    // Return the environment variable in a JSON response
    return NextResponse.json({
        endpoint: '/api/sven_test',
        resp: diagnoses, allergies, immunizations
    });
}
