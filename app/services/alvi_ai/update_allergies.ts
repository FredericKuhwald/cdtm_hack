import {chatWithAttachment} from '../../services/google_cloud/gemini_api';
import {read_file_as_base64, update_row_by_id, get_row_by_id} from "@/app/services/supabase/supabase";

/**
 *updates allergies in row with data from pdf, by sven blaba
 */

//config
const supabase_table: string = 'patient_record';

//main
export async function update_allergies(file_name: string,
                                        patient_id: string,
                                        instruction: string = "Du bist ein Diagnose-Extraktor, der Allergieinformaton zu einem Patienten zusammenstellt. Bitte inkludiere ausschließlich Diagnosen, keine sonstigen Befunde"+
                                                        "Nachfolgend erhältst du i) die bisherig bekannten Allergien und ii) ein neues Dokument, in dem du die Allergien extrahierst*. " +
                                                        "Antworte **ausschließlich** im JSON-Format und verwende genau dieses Schema:\n\n" +
                                                        "'name': Bezeichnung der Allergie (z. B. 'Penicillin')" +
                                                        "'icd10_code': zugehöriger ICD-10-Code (z. B. 'Z88.0')" +
                                                        "'date': Datum der Erstdiagnose im YYYY-MM-DD Format" +
                                                        "'details': zusätzliche Informationen zur Allergie" +
                                                        "Wenn keine Allergie gefunden wird, gib bitte: { \"allergies\": [] }",
                                                    output_json: Array<{ name: string; icd10_code: string; date: string; details: string }> = 
                                                        [
                                                        {
                                                            'name': "zB. Penicillin",
                                                            'icd10_code': "z. B. 'Z88.0'",
                                                            'date': "YYYY-MM-DD",
                                                            'details': "zusätzliche Informationen zur Allergie, zB. Bronchospasmus"
                                                        }
                                                        ],
                                        ): Promise<object> {

    // 1) Get the corresponding document from the storage bucket
    const file_content: {
        file_name: string,
        file_mime_type: string,
        file_base64: string
    } = await read_file_as_base64(file_name);

    const fileBase64: string = file_content.file_base64;
    const fileMimeType: string = file_content.file_mime_type;


    // x) Fetch the corresponding database field  pre-existing data
    const data_existing_row: any = await get_row_by_id(supabase_table, patient_id);
    const data_existing_field: string = data_existing_row["allergies"]; //select the correct field from the entire row
    const prompt: string = instruction + "Bisher ist über den Patienten folgendes bekannt: " + data_existing_field;

    // 3) Send known data + image to AI endpoint to update requested information
    const response: any = await chatWithAttachment(prompt, fileBase64, fileMimeType, "gemini-2.0-flash", 1, true, output_json);
    const data_update: string = response;
    console.log("data_extraction", update_allergies);

    // 4) Save the extraction to the corresponding element in the database
    return await update_row_by_id(supabase_table, patient_id, {allergies: data_update});

}
