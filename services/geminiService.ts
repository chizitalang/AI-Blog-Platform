import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// Note: In a production FastAPI app, you might proxy this through your backend
// to keep the key secure, but for this frontend demo, we use it directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBlogDraft = async (topic: string, tone: string = "professional"): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      You are an expert technical blog writer.
      Write a comprehensive, engaging blog post about: "${topic}".
      Tone: ${tone}.
      Format: Markdown.
      Structure:
      - Engaging Title (H1)
      - Introduction
      - Key concepts (use H2 and H3)
      - Code examples if relevant (using markdown code blocks)
      - Conclusion.

      Do not include the markdown code fences (\`\`\`) at the start or end of the response, just return the raw markdown content.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw new Error("Failed to generate content. Please check your API key.");
  }
};

export const improveContent = async (currentContent: string, instruction: string): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model: model,
      contents: `
        Act as a professional editor.
        Instruction: ${instruction}
        
        Original Content:
        ${currentContent}

        Return the rewritten content in Markdown format. Do not wrap in code fences.
      `,
    });
    return response.text || currentContent;
  } catch (error) {
    console.error("Gemini improvement error:", error);
    throw error;
  }
};