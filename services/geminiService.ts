
import { GoogleGenAI } from "@google/genai";

// Verificação de segurança para evitar erro em ambientes onde a chave não está injetada
const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;

export async function getFormBotReply(userMessage: string) {
  if (!apiKey) {
    console.warn("FormBot: API_KEY não encontrada. O assistente IA está desativado.");
    return "O link neural com o FormBot está offline no momento. ⚡";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: "You are FormBot, the helpful and futuristic AI assistant of FormApp. Your tone is cool, tech-savvy, and efficient. Use occasional emojis like 🚀, ⚡, or 🤖. Keep responses concise like a chat message.",
      }
    });
    return response.text || "I'm currently recalibrating my neural circuits. Try again in a nanosecond! 🤖";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Disconnected from the grid. Check your connection. ⚡";
  }
}
