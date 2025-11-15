

import { GoogleGenAI, Type } from "@google/genai";
import { NutritionInfo } from "../types";

// Fix: Initialize GoogleGenAI directly with process.env.API_KEY as per guidelines.
// The API key's availability is a hard requirement and handled externally.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const nutritionSchema = {
  type: Type.OBJECT,
  properties: {
    mealName: { type: Type.STRING, description: "The name of the meal, e.g., 'Pancakes with blueberries & syrup'." },
    mealType: { type: Type.STRING, description: "The type of meal, e.g., 'Breakfast', 'Lunch', 'Dinner', 'Snack'." },
    calories: { type: Type.INTEGER, description: "Estimated total calories." },
    carbs: { type: Type.INTEGER, description: "Estimated carbohydrates in grams." },
    protein: { type: Type.INTEGER, description: "Estimated protein in grams." },
    fats: { type: Type.INTEGER, description: "Estimated fats in grams." },
    healthScore: { type: Type.INTEGER, description: "A health score from 1 (unhealthy) to 10 (very healthy)." },
    advice: { type: Type.STRING, description: "A short piece of advice for this meal." }
  },
  required: ["mealName", "mealType", "calories", "carbs", "protein", "fats", "healthScore", "advice"]
};

function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string; } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (error) => reject(error);
  });
}


export async function analyzeImageForNutrition(imageFile: File): Promise<NutritionInfo> {
    // Fix: Removed check for API_KEY as its availability is assumed per guidelines.
    const imagePart = await fileToGenerativePart(imageFile);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    imagePart,
                    { text: "Analyze the image and provide nutritional information for this meal. Be as accurate as possible." }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: nutritionSchema
            }
        });

        const jsonText = response.text;
        const parsedData = JSON.parse(jsonText);
        
        return parsedData as NutritionInfo;

    } catch (error) {
        console.error("Error analyzing image with Gemini API:", error);
        throw new Error("Failed to analyze nutritional information. Please try again.");
    }
}