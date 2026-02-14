
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getFormBotReply(userMessage: string) {
  try {
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
