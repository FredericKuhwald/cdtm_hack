import {chatWithAttachment} from '../../services/google_cloud/gemini_api';
import {read_file_as_base64, update_row_by_id} from "@/app/services/supabase/supabase";

/**
 *
 */
export async function classify_file_type(file_name: string,
                                         patient_id: number,
                                         instruction: string = "Was für eine Art von Dokument sieht man auf diesem Bild? Bitte ordne eine (!) der folgenden  die folgenden Optionen zu: " +
                                             "Option 1: Ein Arztbrief, in diesem Fall antworte bitte mit der file_type_classification: 'medical_letter'. " +
                                             "Option 2: Ein Impfpass (typischerweise ein gelbes Heftchen), in diesem Fall antworte bitte mit der file_type_classification: 'vaccine_certificate'. " +
                                             "Option 3: Ein Labor-Report oder Bluttest oder ähnliches, in diesem Fall antworte bitte mit der file_type_classification: 'lab_report'. " +
                                             "Option 4: Ein sonstiges medizinisches Dokument, in diesem Fall antworte bitte mit der file_type_classification: 'other'. " +
                                             "Bitte antworte im JSON Format. Bitte alle Werte mit dem Datentyp Text hinterlegen. " +
                                             "Das JSON soll die folgenden Felder enthalten: 'patient_name', 'patient_date_of_birth', 'sender_institution', 'sender_department', 'diagnoses'. " +
                                             "Wenn du etwas nicht finden oder lesen oder erkennen kannst bitte für das file_type_classification Feld 'error' eintragen. Bitte denke dir keine Informationen aus. ",
                                         output_json: object = {
                                             file_type_classification: "medical_letter | vaccine_certificate | lab_report | other | error",
                                         }): Promise<object> {

    // 1) Get the corresponding document from the storage bucket
    const file_content: {
        file_name: string,
        file_mime_type: string,
        file_base64: string
    } = await read_file_as_base64(file_name);

    const fileBase64: string = file_content.file_base64;
    const fileMimeType: string = file_content.file_mime_type;

    // 2) Send image to AI endpoint to identify requested information
    const response: any = await chatWithAttachment(instruction, fileBase64, fileMimeType, "gemini-2.0-flash", 1, true, output_json);
    const file_type_classification: string = response["file_type_classification"];
    console.log("file_type_classification", file_type_classification);

    // 3) Save the classification to the corresponding element in the database
    return await update_row_by_id('test_table_fk', patient_id, {file_type: file_type_classification});

}
