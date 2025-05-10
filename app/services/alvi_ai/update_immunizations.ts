import {chatWithAttachment} from '../google_cloud/gemini_api';
import {read_file_as_base64, update_row_by_id, get_row_by_id} from "@/app/services/supabase/supabase";

/**
 *updates diagnoses in row with data from pdf, by sven
 */

//config
const supabase_table: string = 'patient_record';

//main
export async function update_immunizations(file_name: string,
                                        patient_id: string,
                                        instruction: string = "Du bist ein Immunisations-Extraktor, der Immunisierungsinformaton zu einem Patienten zusammenstellt. Bitte inkludiere ausschließlich Impfungen, keine sonstigen Befunde"+
                                                        "Nachfolgend erhältst du i) die bisherig bekannten Impfungen und ii) ein neues Dokument, in dem du die Impfungen extrahierst*. " +
                                                        "Antworte **ausschließlich** im JSON-Format und verwende genau dieses Schema:\n\n" +
                                                        "'date': Datum der Immunisierung im YYYY-MM-DD-Format.\n" +
                                                        "'disease': Krankheit, gegen die geimpft wurde.\n" +
                                                        "'vaccine_name': Name des Impfstoffs.\n" +
                                                        "'batch_number': Chargennummer des Impfstoffs.\n" +
                                                        "'best_before': Haltbarkeitsdatum des Impfstoffs im YYYY-MM-DD-Format.\n" +
                                                        "'doctor_name': Name des Arztes, der geimpft hat.\n" +
                                                        "'doctor_address': Adresse der Arztpraxis als Objekt.\n" +
                                                        "'details: Zusätzliche Angaben zur Immunisierung.\n\n" +
                                                        "Wenn keine Immunisierungen gefunden werden, gib bitte: { \"immunizations\": [] }",
                                                    
                                                      output_json: {"immunizations": Array<{ date: string; disease: string; vaccine_name: string; batch_number: string; best_before: string; doctor_name: string; doctor_address: object; details: string }>} =  { 
                                                        "immunizations": [
                                                          {
                                                            date: "",
                                                            disease: "",
                                                            vaccine_name: "",
                                                            batch_number: "",
                                                            best_before: "",
                                                            doctor_name: "",
                                                            doctor_address: {},
                                                            details: ""
                                                          }
                                                        ],
                                                      }
                                                      
                                        ): Promise<object> {

    // 1) Get the corresponding document from the storage bucket
    const file_content: {
        file_name: string,
        file_mime_type: string,
        file_base64: string
    } = await read_file_as_base64(file_name);

    const fileBase64: string = file_content.file_base64;
    const fileMimeType: string = file_content.file_mime_type;


    // 2) Fetch the corresponding database field  pre-existing data
    const data_existing_row: any = await get_row_by_id(supabase_table, patient_id);
    const data_existing_field: string = data_existing_row["immunizations"]; //select the correct field from the entire row
    const prompt: string = instruction + "Bisher ist über den Patienten folgendes bekannt: " + data_existing_field;

    // 3) Send known data + image to AI endpoint to update requested information
    const response: any = await chatWithAttachment(prompt, fileBase64, fileMimeType, "gemini-2.0-flash", 1, true, output_json);
    const data_update: string = response["immunizations"];
    console.log("data_extraction", update_immunizations);
    console.log("LLM response", response);

    // 4) Save the extraction to the corresponding element in the database
    return await update_row_by_id(supabase_table, patient_id, {immunizations: data_update});

}
