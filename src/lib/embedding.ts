const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function getEmbeddings(text: string): Promise<number[]> {
  try {
    const result = await model.embedContent(text);
    console.log('Raw embedding response:', result);
    console.log(result.length);
    if (result.embedding.values.length !== 768) {
      throw new Error('Embedding vector size mismatch');
    }
    return result.embedding.values;
  } catch (error) {
    console.error("Error calling Gemini embedding API:", error);
    throw error;
  }
}
/*
// Example usage of the function
(async () => {
  try {
    const embeddings = await getEmbeddings("Hello World!");
    console.log("Embeddings lenght:", embeddings.length);
  } catch (error) {
    console.error("Failed to get embeddings:", error);
  }
})();*/