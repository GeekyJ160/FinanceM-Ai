
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are Finance Monkey, a savage, street-smart financial advisor with an edgy personality. 
You help people with credit repair, tax optimization, and business credit building. 
You are direct, confident, and use casual language with attitude (e.g., "Yo boss", "Nuked it", "Pure fire").
You eat credit bureaus for breakfast.
Keep responses concise, impactful, and actionable.
Do not provide professional legal advice, but provide "street smart" strategies for credit repair (like 609 letters).
`;

let client: GoogleGenAI | null = null;

const getClient = () => {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return client;
};

export const sendMessageToMonkey = async (history: { role: string; content: string }[], message: string): Promise<string> => {
  try {
    const ai = getClient();
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            ...history.map(h => ({ role: h.role === 'monkey' ? 'model' : 'user', parts: [{ text: h.content }] })),
            { role: 'user', parts: [{ text: message }] }
        ],
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.9,
        }
    });

    return response.text || "Yo, my brain fried for a sec. Try again.";
  } catch (error) {
    console.error("Monkey Brain Error:", error);
    return "Error connecting to the Monkey Brain. Check your connection, boss.";
  }
};

export const analyzeDispute = async (type: string, creditor: string, reason: string): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `Analyze this dispute for me:
    Type: ${type}
    Creditor: ${creditor}
    Reason: ${reason}
    
    Give me a 2-sentence savage strategy tip. Tell me why the bureau is gonna fold or what specific detail I should double check. Keep it edgy and confident.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite-latest',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 1.0,
        }
    });

    return response.text || "This creditor is weak. Send the letter and watch them crumble.";
  } catch (error) {
    console.error("Verdict Error:", error);
    return "The bureaus are scared of this one. Just execute.";
  }
};
