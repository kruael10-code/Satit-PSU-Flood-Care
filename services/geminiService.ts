import { GoogleGenAI, Type } from "@google/genai";
import { RiskLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Triage Service: Analyzes student reports to determine urgency
export const analyzeReportPriority = async (
  message: string,
  category: string
): Promise<{ riskLevel: RiskLevel; summary: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Student Report from Flood Zone (Pattani, Rusamilae): "${message}". Category: ${category}`,
      config: {
        systemInstruction: `You are a crisis management AI for a school in a flood zone. 
        Analyze the student's report. 
        Assign a RiskLevel (SAFE, CAUTION, DANGER, CRITICAL).
        CRITICAL: Life threatening, rapid water rise, trapped, medical emergency.
        DANGER: High water, no food/water, power outage over 24h.
        CAUTION: Water nearby, supplies low.
        SAFE: Checking in, no immediate issues.
        Also provide a very short 5-word summary.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: {
              type: Type.STRING,
              enum: [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL]
            },
            summary: { type: Type.STRING }
          },
          required: ["riskLevel", "summary"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Triage Error:", error);
    return { riskLevel: RiskLevel.MEDIUM, summary: "Analysis failed, please review manually." };
  }
};

// Chat Service: For general flood advice
export const getFloodAdvice = async (history: { role: string; parts: { text: string }[] }[], newMessage: string) => {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: "You are a helpful flood safety assistant for students in Pattani. Keep answers short, encouraging, and practical. Prioritize safety instructions. If asked about evacuation, tell them to wait for official school boats unless in immediate danger.",
      },
      history: history.map(h => ({ role: h.role, parts: h.parts }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "Network error. Please stay safe and try again.";
  }
};
