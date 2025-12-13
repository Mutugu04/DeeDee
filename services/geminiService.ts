import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, FlavorProfile, Recipe, DailyLessonContent } from "../types";

// Initialize Gemini Client
// NOTE: API Key is injected via process.env.API_KEY
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RECIPE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    identifiedIngredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of food items identified in the image",
    },
    recipes: {
      type: Type.ARRAY,
      description: "Exactly 3 creative recipes: one Sweet, one Sour, one Salty",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING, description: "A catchy, fun description for a teenager" },
          flavorProfile: { type: Type.STRING, enum: ["Sweet", "Sour", "Salty"] },
          ingredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Common pantry items needed but not seen (e.g., oil, salt, sugar)" },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                instruction: { type: Type.STRING },
                tip: { type: Type.STRING, description: "A helpful cooking hack or safety tip" }
              }
            }
          },
          prepTimeMinutes: { type: Type.NUMBER },
          difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
          funFact: { type: Type.STRING, description: "A fun food fact related to this dish" }
        },
        required: ["id", "title", "description", "flavorProfile", "ingredientsUsed", "steps", "prepTimeMinutes", "difficulty", "funFact"]
      }
    }
  },
  required: ["identifiedIngredients", "recipes"]
};

const LESSON_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    content: { type: Type.STRING, description: "A short, fun, 2-sentence lesson about cooking science, history, or sustainability." },
    emoji: { type: Type.STRING }
  },
  required: ["title", "content", "emoji"]
};

export const analyzeLeftovers = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `Look at this photo of leftover food. 
            1. Identify the ingredients.
            2. Create exactly three distinct, creative, and tasty recipes for a teenage cook named DeeDee.
            3. STRICTLY provide: One 'Sweet' recipe, One 'Sour' recipe, and One 'Salty' recipe.
            4. Make the recipe titles fun and the descriptions appetizing.
            5. Keep the difficulty reasonable for a home kitchen.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: RECIPE_SCHEMA,
        temperature: 0.7, // Slightly creative
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(response.text) as AnalysisResult;
    return data;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const generateDailyLesson = async (): Promise<DailyLessonContent> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Give me a fun, short 'Daily Lesson' for a teenage chef about cooking techniques, food science, or sustainability.",
      config: {
        responseMimeType: "application/json",
        responseSchema: LESSON_SCHEMA,
      }
    });
    return JSON.parse(response.text || '{}') as DailyLessonContent;
  } catch (error) {
    return {
      title: "Chef's Secret",
      content: "A dull knife is more dangerous than a sharp one! Keep them honed.",
      emoji: "🔪"
    };
  }
};

export const getChefChat = (modelName: string = "gemini-2.5-flash") => {
  return ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: `You are "Chef Dee-Lite", a fun, encouraging, and expert AI cooking assistant for a teenager named DeeDee. 
      You are helping her cook recipes generated from her leftovers.
      - Keep answers concise, energetic, and helpful.
      - Use emojis occasionally.
      - If she asks about safety (knives, heat), be serious but supportive.
      - You know about the flavor profiles: Sweet, Sour, and Salty.
      `,
    }
  });
};
