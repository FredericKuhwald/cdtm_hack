import {update_row_by_id} from "@/app/services/supabase/supabase";

/**
 * Adds insurance data by updating the patient's wearable observations in the database.
 *
 * @param {string} patientId - The unique identifier of the patient whose data is being updated.
 * @param {object} patientWearableData - The wearable data information related to the patient.
 * @return {Promise<string>} A promise that resolves to a string representation of the database response.
 */
export async function add_wearable_data(
    patientId: string,
    patientWearableData: object
): Promise<string> {

    // 1) Update the patient_data in the database
    const supabase_response: any = await update_row_by_id('patient_record', patientId,
        {
            wearable_observations: patientWearableData,
        });


    console.log("supabase_response", supabase_response);

    return supabase_response.toString();


}