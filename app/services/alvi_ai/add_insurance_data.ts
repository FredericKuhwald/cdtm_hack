import {update_row_by_id} from "@/app/services/supabase/supabase";

/**
 * Adds insurance data to a patient's record in the database.
 *
 * @param {number} patientId - The unique identifier of the patient.
 * @param {string} patientFirstName - The first name of the patient.
 * @param {string} patientLastName - The last name of the patient.
 * @param {string} patientDOB - The date of birth of the patient in YYYY-MM-DD format.
 * @param {object} patientAddress - The address details of the patient.
 * @param {object} patientInsurance - The insurance details of the patient.
 * @return {Promise<string>} A promise that resolves to the response from the database after updating the patient's record.
 */
export async function add_insurance_data(
    patientId: string,
    patientFirstName: string, patientLastName: string, patientDOB: string,
    patientAddress: object, patientInsurance: object
): Promise<string> {

    // 1) Update the patient_data in the database
    const supabase_response: any = await update_row_by_id('patient_record', patientId,
        {
            first_name: patientFirstName,
            last_name: patientLastName,
            dob: patientDOB,
            address: patientAddress,
            insurance: patientInsurance
        });


    console.log("supabase_response", supabase_response);

    return supabase_response.toString();


}