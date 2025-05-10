import {chatWithAttachment} from '../../services/google_cloud/gemini_api';
import {read_file_as_base64} from "@/app/services/supabase/supabase";

/**
 * Creates a preconfigured Axios client for OpenAI API.
 * @returns AxiosInstance - Configured Axios client.
 */
export async function process_medical_letter(file_name: string,
                                             instruction: string = "Was sieht man auf diesem Bild? Bitte extrahiere die folgenden Informationen: " +
                                                 "Den patient_name der Person um die es geht. Im Format 'Nachname(n), Vorname(n)'. Ohne 'Frau' oder 'Herr' oder Titel. Bitte jeweils ersten Buchstaben groß schreiben. " +
                                                 "Das patient_date_of_birth (Geburtsdatum) der Person um die es geht. Im Format YYYY-MM-DD. Es gibt Teilweise Briefe von der Deutschen Rentenversicherung bei denen das DOB schwer zu erkennen ist: " +
                                                 "Bei diesen gibt es oben links verschiedene Eingabefelder (z.B. 'Versicherungsnummer', 'Kennzeichen' etc.), das Geburtstdatum ist hier in einem Feld mit dem Titel 'Geb.-Datum, sofern nicht in o.a. VSNR enthalten' zu finden. " +
                                                 "Es ist eine 6 Stellige Nummer, hier ist das Format DDMMYY. Also z.B. 1 0 0 6 6 8 ist als 1968-06-10 zu extrahieren. " +
                                                 "Das in Deutschland übliche Format Datums zu schreiben ist TT.MM.JJJJ oder TT.MM.JJ - außer es gibt gute Gründe / Indikationen das es im konkreten Fall anders ist gehe davon aus das das Datum auf diese Weise im Brief steht." +
                                                 "Die sender_institution der Name / bzw. die (übergeordnete) Institution die den Brief geschrieben hat. z.B. Alb Fils Klinikum. Stauferklinik, ... " +
                                                 "Die sender_department Abteilung aus der der Brief stammt (z.B. Innere Medizin). z.B. bei einem Klinikum die Fachabteilung, bei einer Praxis einfach nochmal der Praxis Name. " +
                                                 "Der Empfänger der Briefe sind i.d.R. die Hausärztliche Gemeinschaftspraxis Faurndau (Drs Kuhwald, Liebrich, Gromolus). Diese sind entsprechend NIE (!) die sender_institution oder das sender_department. " +
                                                 "Wenn vorhanden die Diagnose die gestellt wird. Die einzelnen Diagnosen bitte mit Semikolon trennen. " +
                                                 "Sollte es sich um den Brief einer Radiologie / einen Radiologie Befund handeln bitte in das Feld 'diagnoses' anstelle der Diagnosen die Art der Untersuchung eintragen. z.B. Röntgen Thorax, MRT-, CT- etc. " +
                                                 "Bitte antworte im JSON Format. Bitte alle Werte mit dem Datentyp Text hinterlegen. " +
                                                 "Das JSON soll die folgenden Felder enthalten: 'patient_name', 'patient_date_of_birth', 'sender_institution', 'sender_department', 'diagnoses'. " +
                                                 "Wenn du etwas nicht finden kannst bitte für das jeweilige Feld 'NA' eintragen. Bitte denke dir keine Informationen aus. " +
                                                 "Sollte der Inhalt des Dokuments kein Arztbrief sein bitte trage in alle Felder 'NA' ein und bei 'diagnoses' bitte 'Kein Arztbrief'.",
                                             output_json: object = {
                                                 patient_name: "last, first",
                                                 patient_date_of_birth: "YYYY-MM-DD",
                                                 sender_institution: "",
                                                 sender_department: "",
                                                 diagnoses: "diagnosis1; diagnosis2; diagnosis3"
                                             },
                                             add_patient_id: boolean = true): Promise<object> {

    // 1) Get the corresponding document from the database
    // if it is a png -> chatWithImage
    // if it is a pdf -> extract the first page and convert it to png -> chatWithImage
    const file_content: {
        file_name: string,
        file_mime_type: string,
        file_base64: string
    } = await read_file_as_base64(file_name);


    const fileBase64: string = file_content.file_base64;
    const fileMimeType: string = file_content.file_mime_type;


    // 2) Send image to OpenAI API to identify requested information
    const response: any = await chatWithAttachment(instruction, fileBase64, fileMimeType, "gemini-2.0-flash", 1, true, output_json);
    const patient_first_name: string = response["patient_name"].split(",")[1].trim();
    const patient_last_name: string = response["patient_name"].split(",")[0].trim();
    const patient_date_of_birth: string = response["patient_date_of_birth"];
    const sender_institution: string = response["sender_institution"];
    const sender_department: string = response["sender_department"];
    const diagnoses: string = response["diagnoses"];


    // 3) Try to match the patient (if requested)
    let patient_id: number = -1;
    if (add_patient_id) {
        console.log("Looking for patient (first, last, date): ", patient_first_name, patient_last_name, patient_date_of_birth);
        // get all patients, search for the best match and return the patient_id
        const patients_list: Patient[] = await getPatientListMetadata()
        const matched_patient: {
            patient_id: number,
            match_confidence: number,
            match_type: string,
            match_record: string
        } = findBestPatientMatch(patient_first_name, patient_last_name, patient_date_of_birth, patients_list);
        console.log("Matched patient: ", matched_patient);
        patient_id = matched_patient.patient_id;
    }


    // 4) Add the identified information to the sharepoint list element metadata
    const sp_list_id: string = 'e8bf0b50-c674-4b91-be07-ffacf7326e84'
    const sharepoint_update_response: object = await updateElement(sp_list_id, element_id, {
        patient_first_name: patient_first_name,
        patient_last_name: patient_last_name,
        patient_date_of_birth: patient_date_of_birth,
        sender_institution: sender_institution,
        sender_department: sender_department,
        diagnoses: diagnoses,
        patient_id: patient_id,
        FileLeafRef: new_file_name,
        new_file_name: new_file_name
    });

    // 5) Return the requested information
    response["matched_patient_id"] = patient_id;
    response["sharepoint_update_response"] = sharepoint_update_response;

    return response;

}
