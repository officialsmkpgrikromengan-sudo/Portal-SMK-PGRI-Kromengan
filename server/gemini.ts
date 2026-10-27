import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

/**
 * Lazy initialization helper for Google GenAI SDK.
 * Ensures the app server starts smoothly even if GEMINI_API_KEY is not yet configured.
 * API key is strictly maintained on the server and never exposed to the client or GitHub.
 */
export function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is not configured on the server.');
    }
    geminiClient = new GoogleGenAI({ apiKey: key });
  }
  return geminiClient;
}

/**
 * Safe server-side helper for generating text via Gemini 3.8 Flash.
 * Never leaks the API key, headers, or internal credentials to the client.
 */
export async function generateContentServerSide(prompt: string, systemInstruction?: string): Promise<string> {
  const ai = getGemini();
  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: systemInstruction ? { systemInstruction } : undefined
  });
  return response.text || '';
}
