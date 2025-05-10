import {GoogleGenerativeAI, GenerativeModel, GenerateContentResult} from "@google/generative-ai";

/**
 * Extracts JSON from a response, handling Markdown-wrapped JSON.
 * Throws an error if the response is not a valid JSON format.
 *
 * @param responseText - The response text from OpenAI.
 * @returns A parsed JSON object.
 * @throws Error if JSON parsing fails or the response is empty.
 */
export function cleanJSONResponse(responseText: string): object {

    if (!responseText) {
        throw new Error("Response text is empty");
    }

    try {
        if (responseText.trim().startsWith("{")) {
            return JSON.parse(responseText);
        }

        const jsonMatch: RegExpMatchArray | null = responseText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1]);
        }

        console.error("Invalid JSON response format:", responseText);
        throw new Error("Invalid JSON response format");
    } catch (error) {
        console.error("Failed to parse JSON from OpenAI response:", error);
        throw new Error("Error parsing JSON response");
    }
}

/**
 * Validates if a given JSON object matches the expected structure.
 * @param jsonData - The JSON response from OpenAI.
 * @param expectedStructure - The expected JSON structure.
 * @returns Boolean indicating whether the structure is valid.
 * @throws Error if the structure is invalid.
 */
export function validateJSONStructure(jsonData: object, expectedStructure: object): boolean {

    const expectedKeys: string[] = Object.keys(expectedStructure);

    const missingKeys: string[] = expectedKeys.filter(key => !(key in jsonData));
    if (missingKeys.length > 0) {
        console.error("Missing keys in JSON response:", missingKeys);
        throw new Error(`Invalid JSON structure. Missing keys: ${missingKeys.join(", ")}`);
    }

    return true;
}


export async function chatNoAttachments(
    instructions: string,
    model: string = "gemini-2.0-flash-lite",
    temperature: number = 1,
    enforceJson: boolean = false,
    jsonStructure?: object
): Promise<object | string> {


    let systemMessage: string = "Du bist ein hilfreicher Assistent.";
    if (enforceJson && jsonStructure) {
        instructions += ` VERPFLICHTENDE ANTWORT ART: Gültiges JSON, kein Markdown; ZU VERWENDENDES JSON FORMAT: ${JSON.stringify(jsonStructure)}`;
        systemMessage = `Du bist ein hilfreicher Assistent. Du musst in einem gültigen JSON-Format antworten. Das JSON-Format muss wie folgt aussehen: ${JSON.stringify(jsonStructure)}. Du antwortest immer nur das JSON mit allen Attributen.`;
    }

    const genAI = new GoogleGenerativeAI("AIzaSyAUcaCycvPvoBBYEDWS-lPu-AP7DmuxZHY");
    const genModel: GenerativeModel = genAI.getGenerativeModel({
        model: model,
        systemInstruction: systemMessage,
        generationConfig: {
            temperature: temperature
        }
    });

    const result: GenerateContentResult = await genModel.generateContent([
        instructions,
    ]);


    // parse json and clean it if necessary
    if (enforceJson && jsonStructure) {
        const extractedResponse: object = cleanJSONResponse(result.response.text());
        validateJSONStructure(extractedResponse, jsonStructure);
        return extractedResponse;
    }

    // return the string response if not enforced
    return result.response.text();


}

export async function chatWithAttachment(
    instructions: string,
    attachmentBase64: string,
    attachmentMimeType: string,
    model: string = "gemini-2.0-flash-lite",
    temperature: number = 1,
    enforceJson: boolean = false,
    jsonStructure?: object
): Promise<object | string> {

    let systemMessage: string = "Du bist ein hilfreicher Assistent.";
    if (enforceJson && jsonStructure) {
        instructions += ` VERPFLICHTENDE ANTWORT ART: Gültiges JSON, kein Markdown; ZU VERWENDENDES JSON FORMAT: ${JSON.stringify(jsonStructure)}`;
        systemMessage = `Du bist ein hilfreicher Assistent. Du musst in einem gültigen JSON-Format antworten. Das JSON-Format muss wie folgt aussehen: ${JSON.stringify(jsonStructure)}. Du antwortest immer nur das JSON mit allen Attributen.`;
    }

    const genAI = new GoogleGenerativeAI("AIzaSyAUcaCycvPvoBBYEDWS-lPu-AP7DmuxZHY");
    const genModel: GenerativeModel = genAI.getGenerativeModel({
        model: model,
        systemInstruction: systemMessage,
        generationConfig: {
            temperature: temperature
        }
    });

    const result: GenerateContentResult = await genModel.generateContent([
        {
            inlineData: {
                data: attachmentBase64,
                mimeType: attachmentMimeType,
            },
        },
        instructions,
    ]);


    // parse json and clean it if necessary
    if (enforceJson && jsonStructure) {
        const extractedResponse: object = cleanJSONResponse(result.response.text());
        validateJSONStructure(extractedResponse, jsonStructure);
        return extractedResponse;
    }

    // return the string response if not enforced
    return result.response.text();

}
