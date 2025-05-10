import {create_new_row} from "@/app/services/supabase/supabase";

/**
 * Logs an interaction related to a patient's record into the database.
 *
 * @param {string} patientId - The unique identifier of the patient.
 * @param {string} interactionType - The type of interaction being logged (e.g., message, alert).
 * @param {string} interactionRole - The role of the participant in the interaction (e.g., doctor, patient).
 * @param {string} interactionMessage - The content or details of the interaction message.
 * @return {Promise<string>} A promise that resolves to the response from the database as a string.
 */
export async function log_interaction(
    patientId: string,
    interactionType: string, interactionRole: string, interactionMessage: string
): Promise<string> {

    // 1) Update the patient_data in the database
    const supabase_response: any = await create_new_row('chat_interactions',
        {
            patient_record: patientId,
            interaction_type: interactionType,
            interaction_role: interactionRole,
            interactionMessage: interactionMessage,
        });


    console.log("supabase_response", supabase_response);

    return supabase_response.toString();

}