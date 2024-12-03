'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

// Configure the API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey); // Initialize the Google Generative AI client

// Load the generative model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateEmail(context: string, prompt: string): Promise<string> {
    // Construct the full prompt
    const fullPrompt = `
        You are an AI email assistant embedded in an email client app. Your purpose is to help the user by generating email responses based on the context provided in the email. You have access to the email context and the user's prompt. Your task is to generate a helpful and relevant email response based on the context and the user's prompt. Here is the email context:

        THE TIME NOW IS ${new Date().toLocaleString()}
            
        START CONTEXT BLOCK
        ${context}
        END OF CONTEXT BLOCK
    
        USER PROMPT:
        ${prompt}

        When responding, please keep in mind:
        - Be helpful, clever, and articulate.
        - Rely on the provided email context to inform your response.
        - If the context does not contain enough information to fully address the prompt, politely give a draft Response.
        - Avoid apologizing for previous responses. Instead, indicate that you have updated your response based on the new context.
        - Do not invent or speculate about anything that is not directly supported by the email.
        - Keep your response focused and relevant to the user's prompt.
        - Don't add fluff like 'Heres your email' or 'Here's your email' or anything like that.
        - Directly output the email, no need to say 'Here is your email' or anything like that.
        - No need to output subject.
        - No need to output signature.
        - No need to output greeting.
        - No need to output closing.
        - No need to output any email metadata like date, time, or email addresses.
        - No need to output any email headers like 'From', 'To', 'Subject', 'CC', 'BCC', etc.
        - No need to output any email footers like 'Sent from my iPhone' or 'Sent from my Android device'.
        - No need to output any email disclaimers or legal notices.
        - No need to output any email signatures.
        - No need to output any email attachments.
        - No need to output any email tracking pixels or other tracking mechanisms.
    `;

    try {
        // Generate content using the model
        const output = await model.generateContent(fullPrompt);

        // Check for a valid response and return the text
        if (output && output.response.text()
        ) {
            return output.response.text();
        } else {
            return "No valid response generated.";
        }
    } catch (error) {
        console.error("Error generating email:", error);
        throw new Error("Failed to generate email.");
    }
}


export async function generate(context: string): Promise<string> {
    // Construct the full prompt
    const fullPrompt = `
        You are an AI email assistant embedded in an email client app. Your purpose is to help the user by generating email responses based on the context provided in the email. You have access to the email context and the user's prompt. Your task is to generate a helpful and relevant email response based on the context and the user's prompt. Here is the email context:

        THE TIME NOW IS ${new Date().toLocaleString()}
            
        START CONTEXT BLOCK
        ${context}
        END OF CONTEXT BLOCK
    
        USER PROMPT:
        ${prompt}

        When responding, please keep in mind:
        - Be helpful, clever, and articulate.
        - Rely on the provided email context to inform your response.
        - If the context does not contain enough information to fully address the prompt, politely give a draft Response.
        - Avoid apologizing for previous responses. Instead, indicate that you have updated your response based on the new context.
        - Do not invent or speculate about anything that is not directly supported by the email.
        - Keep your response focused and relevant to the user's prompt.
        - Don't add fluff like 'Heres your email' or 'Here's your email' or anything like that.
        - Directly output the email, no need to say 'Here is your email' or anything like that.
        - No need to output subject.
        - No need to output signature.
        - No need to output greeting.
        - No need to output closing.
        - No need to output any email metadata like date, time, or email addresses.
        - No need to output any email headers like 'From', 'To', 'Subject', 'CC', 'BCC', etc.
        - No need to output any email footers like 'Sent from my iPhone' or 'Sent from my Android device'.
        - No need to output any email disclaimers or legal notices.
        - No need to output any email signatures.
        - No need to output any email attachments.
        - No need to output any email tracking pixels or other tracking mechanisms.
    `;

    try {
        // Generate content using the model
        const output = await model.generateContent(fullPrompt);

        // Check for a valid response and return the text
        if (output && output.response.text()
        ) {
            return output.response.text();
        } else {
            return "No valid response generated.";
        }
    } catch (error) {
        console.error("Error generating email:", error);
        throw new Error("Failed to generate email.");
    }
}