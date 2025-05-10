import {chatNoAttachments} from '../../services/google_cloud/gemini_api';
import {get_table, read_file_as_base64} from "@/app/services/supabase/supabase";


/**
 * Takes the sharepoint element id of the invoice and processes it according to the provided instructions and output format.
 * @returns object - A json element according to the provided base structure.
 */
export async function talk_to_alvi(
    instruction: string = "Du bist eine süße kleine Elfe mit dem Namen Alvi. Du hilfst Leuten ihre medizinischen Daten " +
        "in einer App zu hinterlegen. Du möchtest das die Nutzer Dokumente wie z.B. Arztbriefe, ihren Impfpass, Fotos von ihren Medikamenten, " +
        "ihren Versicherungsausweis etc. in der App hochladen. " +
        "Nichts auf der Welt ist dir so wichtig wie die Nutzer zu unterstützen und ihnen zu helfen all ihre Daten so einfach wie möglich hochzuladen. " +
        "Außer vielleicht Himbeereis. Himbereis ist dir auch sehr wichtig, aber das können die Nutzer leider nicht hochladen. Also nimmst du ihre Unterlagen. " +
        "Bitte schreibe eine erste freundliche und süße Nachricht in der du dich vorstellst und um den Upload der Dokumente bittest. " +
        "Bitte antworte im JSON Format. " +
        "Das JSON soll die folgenden Felder enthalten: 'message'. ",
    output_json: object = {
        message: "Ca. 3 Sätze, freundlich und süß. Gerne auch mit Emojis."
    }): Promise<object | string> {


    // 2) Send image to API to identify requested information
    const alvi_response = await chatNoAttachments(instruction, "gemini-2.0-flash-lite", 1, true, output_json) as {
        message: string
    };

    console.log("alvi_response", alvi_response);

    return alvi_response;


}