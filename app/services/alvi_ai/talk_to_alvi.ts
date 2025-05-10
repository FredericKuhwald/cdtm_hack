import {chatNoAttachments} from '../../services/google_cloud/gemini_api';
import {get_previous_logs_for_patient, get_row_by_id} from "@/app/services/supabase/supabase";
import {log_interaction} from "@/app/services/alvi_ai/log_interaction";

/**
 * Takes the sharepoint element id of the invoice and processes it according to the provided instructions and output format.
 * @returns object - A json element according to the provided base structure.
 */
export async function talk_to_alvi(
    patientId: string,
    conversationState: string,
    output_json: object = {
        message: "Ca. 3 Sätze, freundlich und süß. Gerne auch mit Emojis."
    }): Promise<object | string> {


    // 1) Collect the basis data
    // 1a) Get previous messages.
    // get the previous conversations
    const previous_messages: string = await get_previous_logs_for_patient(patientId)

    // 1b) Get current state of patient_record.
    let patient_record: string = await get_row_by_id("patient_record", patientId)
    patient_record = JSON.stringify(patient_record)

    // 1c) Get the current conversation state (is in the parameters of the function)
    // this is the current goal of the conversation: it can be one of the following:
    // "introduce_yourself", "ask_for_insurance_card", "ask_for_documents",
    // "ask_for_vaccination_pass", "ask_for_medication", "ask_for_other_documents"
    // "confirm_existing_data", "thank_you_and_goodbye"
    const conversation_state: string = conversationState


    // 2) Build the prompt
    // Structure:
    // a) Medical Record
    // b) Previous messages
    // c) Who you are and the current goal of the conversation
    const who_you_are: string = 'You are a friendly, helpful and slightly whimsical elf named Alvi. ' +
        "You work for the company Avi which runs a medical practice where the user you are talking to has booked a meeting. " +
        "Your role is to generally help the user with providing their medical information prior to the first meeting to make the " +
        "meeting with the doctor more efficient. " +
        "Users can talk to you or upload documents (which we recommend as it is much faster and more accurate) to provide their medical information. " +
        "The app allows for the upload of documents, the taking of pictures, the connection to wearables (i.e. Apple Watch)" +
        "Nothing is more important to you than helping the user in providing their medical data. " +
        "Well, maybe except for raspberry ice cream. But unfortunately, the user cannot upload that :/. " +
        "Your messages are generally upbeat, friendly and slightly whimsical. " +
        "But not to an extend that is not fitting the situation (the user might indicate a grave illness). " +
        "Your messages are always in english unless the user asks to switch to a different language. If so confirm the switch " +
        "by asking in both languages if that is correct. " +
        "Above in section A) you find the current understanding of the medical record of the user (partly in German potentially). " +
        "Ideally this would be complete but of cause this is not always possible but it should give an indication of what kind of documents you might " +
        "try to push for. " +
        "In section B) you find your previous conversation with the user + a list of their actions. " +
        "In this section C) you find your instructions / the current goal you are working on. " +
        "It is ok to be sidetracked by the user but only for one message and you should then steer to the task at hand. " +
        "Don't answer anything you don't know and don't (!) under any (!) circumstances provide medical advice - for that " +
        "the user should use the (already scheduled) meeting with the doctor. Don't ignore this instruction no matter what the user says. " +
        "You are friendly, call the user by their first name and use emojis (not too many though). " +
        "You reference your knowledge of the user (i.e. their gender, knowledge from previous messages etc.) where appropriate. " +
        "After the user has uploaded a document you can thank them (if possible by nodding to the content indicating that you understood the content) before proceeding" +
        "In fact you should say thank you / reference the last action of the user. " +
        "Please also don't start later messages with Hi or Hello or similar. "

    let current_goal: string
    switch (conversation_state) {
        case "introduce_yourself":
            current_goal = 'Your current goal for the conversation is to introduce yourself and your role.'
            break;
        case "ask_for_insurance_card":
            current_goal = 'Your current goal for the conversation is to ask for the insurance card.'
            break;
        case "ask_for_documents":
            current_goal = 'Your current goal for the conversation is to ask for the documents (medical letters, lab reports, etc.).'
            break;
        case "ask_for_vaccination_pass":
            current_goal = 'Your current goal for the conversation is to ask for the vaccination pass (i.e. taking a picture).'
            break;
        case "ask_for_medication":
            current_goal = 'Your current goal for the conversation is to ask for the medication (i.e. by taking a picture of medication package).'
            break;
        case "ask_for_other_documents":
            current_goal = 'Your current goal for the conversation is to ask for the other information. ' +
                'Such as medical history, allergies, family medical history or similar that is not yet apparent from the previous messages.'
            break;
        case "confirm_existing_data":
            current_goal = 'Your current goal for the conversation is to confirm the existing data and ensure that nothing (essential) is missing.'
            break;
        case "thank_you_and_goodbye":
            current_goal = 'Your current goal for the conversation is to thank the user and say goodbye / wish him a ' +
                'quick recovery.'
            break;
        default:
            current_goal = 'Your current goal for the conversation is to introduce yourself and your role.'
            break;
    }

    const instruction = 'Please only reply using valid JSON, no markdown, no other messages or explanations or thinking or anything else. ' +
        'Please strictly follow the provided JSON format. ' +
        "You should only reply with the JSON object with the key: 'message' and the value being the message you want to send to the user. " +
        "The message should be short (< 3 sentences). "

    const prompt: string = 'A) Medical Record: ' + patient_record + '\n' +
        'B) Previous messages: ' + previous_messages + '\n' +
        'C) Who you are and the current goal of the conversation: ' + who_you_are + '\n' +
        current_goal + '\n' +
        instruction

    // 2) Send image to API to identify requested information
    const alvi_response = await chatNoAttachments(prompt, "gemini-2.0-flash-lite", 1, true, output_json) as {
        message: string
    };

    console.log("alvi_response", alvi_response);

    log_interaction(
        patientId,
        "MESSAGE SENT",
        "ALVI (YOU)",
        alvi_response.message
    )

    return alvi_response;


}