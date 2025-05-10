import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client with your environment variables
const supabaseUrl: string = 'https://xisylfkrswysjyvrdhen.supabase.co' // process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpc3lsZmtyc3d5c2p5dnJkaGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzU0MzksImV4cCI6MjA2MjQxMTQzOX0._FqNybw33RDxaA_NiPvLv3sJhYhpjpcsuSJyW-Z3GNI' // process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key must be provided in environment variables');
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

/**
 * Fetches all rows from the specified Supabase table.
 * @param table_name Name of the table to fetch data from.
 * @returns An array of rows from the table, or throws an error if fetching fails.
 */
export async function get_table(table_name: string) {
    const { data, error } = await supabase
        .from(table_name)
        .select('*');

    if (error) {
        throw new Error(`Error fetching data from table ${table_name}: ${error.message}`);
    }

    return data;
}

/**
 * Creates a file in the specified storage path and associates metadata with a database entry.
 *
 * @param {string} path - The path where the file will be stored in the storage bucket.
 * @param {Blob | File | Buffer} file - The file to be uploaded to storage.
 * @param {string} patient_id - The identifier of the patient, used to associate the file with a patient record in the database.
 * @return {Promise<any>} A promise that resolves to the result of creating a new database entry after the file is successfully uploaded.
 * @throws {Error} If the file upload to storage fails.
 */
export async function create_file(path: string, file: Blob | File | Buffer, patient_id: string): Promise<any> {
    const { error } = await supabase
        .storage
        .from('fk-test-bucket')
        .upload(path, file);
    if (error) throw new Error(`Failed to upload file: ${error.message}`);

    // create corresponding entry in the database
    return await create_new_row('documents', {url: path, patient_record: patient_id});


}



/**
 * Reads a file from 'fk-test-bucket' and returns its details as base64.
 * @param path The path (including filename) in the bucket
 * @returns An object with file_name, file_mime_type, and file_base64
 */
export async function read_file_as_base64(path: string): Promise<{file_name: string, file_mime_type: string, file_base64: string}> {
    const { data, error } = await supabase
        .storage
        .from('fk-test-bucket')
        .download(path);
    if (error || !data) throw new Error(`Failed to download file: ${error?.message}`);

    // Read the content as base64
    const fileBuffer: ArrayBuffer = await data.arrayBuffer();
    const base64: string = Buffer.from(fileBuffer).toString('base64');
    const file_name: string = path.split('/').pop() || '';
    const file_mime_type: string = extract_mime_type(file_name)

    return {
        file_name,
        file_mime_type,
        file_base64: base64,
    };
}

/**
 * Extracts the MIME-type of a file based on its extension.
 *
 * @param file_name The name of the file, including its extension.
 * @return The MIME type corresponding to the file extension, or an empty string if the extension is not recognized.
 */
export function extract_mime_type(file_name: string): string {

    const element_file_type: string = file_name.split('.').pop()?.toLowerCase() || 'unknown';
    let element_file_mime_type: string = '';

    if (element_file_type === 'pdf') {
        element_file_mime_type = 'application/pdf';
    } else if (element_file_type === 'png') {
        element_file_mime_type = 'image/png';
    } else if (element_file_type === 'jpg' || element_file_type === 'jpeg') {
        element_file_mime_type = 'image/jpeg';
    }

    return element_file_mime_type;

}

/**
 * Inserts a new row into the specified Supabase table.
 * @param table_name The name of the table
 * @param fields An object containing the column names and values to insert
 * @returns The inserted row, or throws an error if insertion fails
 */
export async function create_new_row(
    table_name: string,
    fields: Record<string, any>
) {
    const { data, error } = await supabase
        .from(table_name)
        .insert([fields])
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to insert row: ${error.message}`);
    }

    return data;
}

/**
 * Updates a row in a Supabase table by id.
 * @param table The name of the table
 * @param id The id of the row to update (assumes the column is named 'id')
 * @param updates An object containing the fields and new values to update
 * @returns The updated row, or throws an error if update fails
 */
export async function update_row_by_id(
    table: string,
    id: number | string,
    updates: Record<string, any>
) {
    const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select();

    if (error) throw new Error(`Failed to update row: ${error.message}`);

    if (!data || data.length !== 1) {
        throw new Error(`Failed to update row: ${data && data.length === 0 ? 'No row found with the specified id' : 'Multiple rows updated'}`);
    }

    return data[0];
}



/**
 * Fetches a single row by id from the specified table.
 * @param table_name The name of the table
 * @param id The id of the row to retrieve (assumes the column is named 'id')
 * @returns The row data, or throws an error if retrieval fails
 */
export async function get_row_by_id(
    table_name: string,
    id: number | string
) {
    const { data, error } = await supabase
        .from(table_name)
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw new Error(`Failed to fetch row: ${error.message}`);
    return data;
}

/**
 * Retrieves and formats previous chat interactions for a patient.
 * @param patientId The unique identifier of the patient.
 * @returns A string listing all previous logs for the patient, sorted by created_at (ascending).
 */
export async function get_previous_logs_for_patient(patientId: string): Promise<string> {
    const { data, error } = await supabase
        .from('chat_interactions')
        .select('interaction_type, interaction_role, interaction_message, created_at')
        .eq('patient_record', patientId)
        .order('created_at', { ascending: true });

    if (error) {

        throw new Error(`Failed to fetch logs: ${error.message}`);
    }

    if (!data || data.length === 0) {
        return '';
    }

    // Combine each row into a formatted string
    const logsString = data
        .map((row: any) =>
            `${row.interaction_type} BY ${row.interaction_role}: ${row.interactionMessage}`
        )
        .join('\n');

    return logsString;
}

