
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

// Always initialize GoogleGenAI with a named parameter for apiKey
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface FileData {
  data: string;
  mimeType: string;
}

export const extractQuestionsFromFiles = async (files: FileData[]): Promise<Question[]> => {
  const fileParts = files.map(file => ({
    inlineData: {
      mimeType: file.mimeType,
      data: file.data.split(',')[1] || file.data,
    },
  }));

  // Upgrade to gemini-3-pro-preview for complex reasoning and extraction tasks
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: {
      parts: [
        ...fileParts,
        {
          text: "Extract all quiz questions from these files/images. For each question, identify the text, all the options (like A, B, C, D or أ, ب, ج, د), the question type (multiple choice or true/false), and the correct answer based on any markings or answer keys present. Return ONLY a JSON array of objects following the defined schema. Use Arabic for text and options. Ensure you capture questions from all provided files.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING },
            type: { 
              type: Type.STRING,
              description: "The type of question: 'boolean' for true/false or 'multiple' for multiple choice."
            },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of options like ['أ. خيار 1', 'ب. خيار 2']. Only provided for multiple choice type."
            },
            correctAnswer: { 
              type: Type.STRING,
              description: "The key of the correct answer like 'أ' or 'ب' or 'صح' or 'غلط'"
            },
          },
          required: ["id", "text", "type", "correctAnswer"],
          propertyOrdering: ["id", "text", "type", "options", "correctAnswer"]
        },
      },
    },
  });

  try {
    // response.text is a property, not a method. Use trim() and handle potential undefined.
    const questions = JSON.parse(response.text?.trim() || "[]") as Question[];
    return questions;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return [];
  }
};
