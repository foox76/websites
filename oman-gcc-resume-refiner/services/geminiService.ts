import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ResumeResult, UserInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A professional 2-3 sentence summary of the role/experience suitable for a CV.",
    },
    bulletPoints: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "A list of strong, action-oriented bullet points describing achievements and responsibilities.",
    },
    refinedProfile: {
      type: Type.OBJECT,
      description: "Corrected version of the user's profile details with proper spelling, capitalization, and formatting.",
      properties: {
        fullName: { type: Type.STRING },
        jobTitle: { type: Type.STRING },
        location: { type: Type.STRING },
        university: { type: Type.STRING },
        degree: { type: Type.STRING },
        languages: { type: Type.STRING },
      },
      required: ["fullName", "jobTitle", "location", "university", "degree", "languages"],
    }
  },
  required: ["summary", "bulletPoints", "refinedProfile"],
};

export const generateProfessionalCV = async (userInfo: UserInfo, rawNotes: string): Promise<ResumeResult> => {
  const modelId = "gemini-2.5-flash"; 

  const systemInstruction = `
    You are an expert Executive Resume Writer specializing in the Oman and GCC (Gulf Cooperation Council) job market.
    
    TASK 1: RESUME REFINEMENT
    Rewrite the raw user notes into a polished, high-level corporate CV entry.
    - **Tone:** Formal, professional, respectful (e.g., suitable for PDO, Omantel, OQ).
    - **Language:** British English spelling.
    - **Structure:** Executive Summary (2-3 sentences) + 4-6 high-impact bullet points using power verbs.

    TASK 2: GLOBAL AUTO-CORRECT
    Review the provided 'User Profile Data' (Name, Job Title, Location, University, Degree, Languages).
    - Correct any spelling mistakes (e.g., "Engeneer" -> "Engineer").
    - Fix capitalization (e.g., "muscat" -> "Muscat, Oman").
    - Standardize formatting.
    - Return these corrected values in the 'refinedProfile' object.

    Input Data to process follows.
  `;

  const prompt = `
    User Profile Data:
    - Full Name: ${userInfo.fullName}
    - Job Title: ${userInfo.jobTitle}
    - Location: ${userInfo.location}
    - University: ${userInfo.university}
    - Degree: ${userInfo.degree}
    - Languages: ${userInfo.languages}

    Raw Experience Notes:
    ${rawNotes}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.3,
      },
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini.");
    }

    const result = JSON.parse(response.text) as ResumeResult;
    return result;

  } catch (error) {
    console.error("Error generating CV content:", error);
    throw error;
  }
};