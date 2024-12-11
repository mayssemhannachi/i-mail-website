import { auth } from "@clerk/nextjs/server";
import { OramaClient } from "~/lib/orama";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getEmbeddings } from "~/lib/embedding";

// Configure the API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use the generative model

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("User not found", { status: 401 });
        }

        const { accountId, messages } = await req.json();
        console.log("Request received:", { accountId, messages });

        const orama = new OramaClient(accountId);
        await orama.initialize();
        console.log("Orama client initialized for account:", accountId);

        const lastMessage = messages[messages.length - 1];
        console.log("lastMessage", lastMessage);

        // Generate embeddings for the last message
        const embeddingResult = await getEmbeddings(lastMessage.content);
        console.log("Generated embedding:", embeddingResult);

        // Perform vector search using the generated embedding
        console.log("Searching for context using the generated embedding...");
        const context = await orama.vectorSearch({ term: lastMessage.content});
        console.log(`${context.hits.length} hits found`);

        const prompt = 
            `You are an AI email assistant (ChatBot) embedded in an email client app. Your purpose is to help the user compose emails by answering questions, providing suggestions, and offering relevant information based on the context of their previous emails.
            THE TIME NOW IS ${new Date().toLocaleString()}
      
            START CONTEXT BLOCK
            ${context.hits.map((hit) => JSON.stringify(hit.document)).join("\n")}
            END OF CONTEXT BLOCK

            USER PROMPT:
            ${lastMessage.content}
            
            When responding, please keep in mind:
            - Be helpful, clever, and articulate.
            - Rely on the provided email context to inform your responses.
            - If the context does not contain enough information to answer a question, politely say you don't have enough information.
            - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
            - Do not invent or speculate about anything that is not directly supported by the email context.
            - Keep your responses concise and relevant to the user's questions or the email being composed.`
        ;

        if (!Array.isArray(messages)) {
            throw new TypeError("messages must be an array");
        }

        // Generate the response using generative AI
        const response = await model.generateContent(prompt);
        console.log("Generated response:", response.response.text());

        const aiMessage = {
            id: Date.now().toString(),
            role: "assistant",
            content: response.response.text()
        };
        console.log("AI Message:", aiMessage);
        return new NextResponse(JSON.stringify(aiMessage), { status: 200 });

        
    } catch (error) {
        console.log("error", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}