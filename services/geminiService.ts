import { GoogleGenAI, Type } from "@google/genai";
import { UserStats, Habit } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMentorWisdom = async (
  completedCount: number,
  totalHabits: number,
  stats: UserStats,
  habits: Habit[],
  uncompletedHabits: Habit[]
): Promise<string> => {
  
  const modelId = "gemini-2.5-flash";
  
  const habitNames = habits.map(h => h.title).join(", ");
  const missed = uncompletedHabits.map(h => h.title).join(", ");

  const prompt = `
    You are a wise RPG Guild Master or a Mystical Spirit Guide. 
    The user is an adventurer tracking their daily habits (quests).
    
    Current Stats:
    - Level: ${stats.level}
    - Streak: ${stats.streak} days
    - Today's Progress: ${completedCount}/${totalHabits} quests completed.
    
    Habits attempted: ${habitNames}
    Habits missing today: ${missed}

    Provide a short, immersive, RPG-themed comment (max 2 sentences).
    If they finished all, celebrate their victory.
    If they missed some, encourage them to persevere or warn them of "decaying mana".
    Make it fun and atmospheric.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "You are an RPG Quest Giver. Speak with flavor and atmosphere.",
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "The spirits are silent today... keep pushing forward, adventurer.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Connection to the arcane realm (API) is unstable. Your deeds are still recorded.";
  }
};

export const analyzeProgress = async (stats: UserStats, history: any[]) => {
  // Advanced analysis for a weekly report (optional feature hook)
  return "Keep up the good work!";
};