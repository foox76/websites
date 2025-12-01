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
    experience: {
      type: Type.ARRAY,
      description: "A list of professional experiences/jobs parsed from the notes. Creates multiple entries if the user mentions different roles/dates in the notes.",
      items: {
        type: Type.OBJECT,
        properties: {
          jobTitle: { type: Type.STRING },
          company: { type: Type.STRING },
          startDate: { type: Type.STRING, description: "e.g. 'Jan 2020' or '2020' or 'Present'" },
          endDate: { type: Type.STRING, description: "e.g. 'Dec 2022' or 'Present'" },
          bulletPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3-5 high-impact bullet points for this specific role."
          }
        },
        required: ["jobTitle", "company", "startDate", "endDate", "bulletPoints"]
      }
    },
    refinedProfile: {
      type: Type.OBJECT,
      description: "Corrected version of the user's profile details.",
      properties: {
        fullName: { type: Type.STRING },
        jobTitle: { type: Type.STRING, description: "The most recent or target job title." },
        company: { type: Type.STRING, description: "The most recent company." },
        location: { type: Type.STRING },
        university: { type: Type.STRING },
        degree: { type: Type.STRING },
        languages: { type: Type.STRING },
        certifications: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of certifications and courses, formatted neatly (e.g. 'PMP - PMI')."
        },
        softSkills: { 
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of 4-6 soft skills."
        },
        hardSkills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of 6-8 technical hard skills."
        }
      },
      required: ["fullName", "jobTitle", "company", "location", "university", "degree", "languages", "certifications", "softSkills", "hardSkills"],
    }
  },
  required: ["summary", "experience", "refinedProfile"],
};

export const generateProfessionalCV = async (userInfo: UserInfo, rawNotes: string): Promise<ResumeResult> => {
  const modelId = "gemini-2.5-flash"; 

  const systemInstruction = `
    You are an expert Executive Resume Writer specializing in the Oman and GCC (Gulf Cooperation Council) job market.
    
    TASK 1: MULTI-JOB EXPERIENCE PARSING (CRITICAL)
    Analyze the 'Raw Experience Notes'.
    - **Split Roles:** If the notes describe **multiple different roles, companies, or time periods** (e.g. "Worked at PDO as Engineer then moved to OQ as Manager"), you MUST generate SEPARATE entries in the 'experience' array for each role.
    - **Ignore Single Input:** IGNORE the single 'Company Name' input field if the notes clearly indicate a history of multiple companies/roles. Rely on the notes for the truth source of the work history.
    - **Dates:** Infer start/end dates from the notes.
    - **Tone:** Formal, professional, respectful (PDO/Omantel style).
    - **Language:** British English spelling.
    - **Metrics:** If the user provides numbers (e.g. '20% increase'), include them.

    TASK 2: GLOBAL AUTO-CORRECT
    Review 'User Profile Data'. Correct spelling, capitalization, and expand GCC acronyms (PDO -> Petroleum Development Oman).
    
    TASK 3: SKILLS EXTRACTION
    - **Soft Skills:** Clean up input or infer 4-5 if empty.
    - **Hard Skills:** 
        - **IF USER PROVIDED INPUT:** Use the user's provided 'Hard Skills' exactly (just clean/format them). Do NOT add inferred skills if the user provided a list.
        - **IF INPUT IS EMPTY:** Infer 6-8 technical skills from Job Title/Notes.
        - **Context:** Avoid generic terms. Be specific (e.g. "Python", "SAP", "Financial Auditing" instead of "Computer Skills").

    TASK 4: CERTIFICATIONS
    - Format neatly (e.g., "Course Name - Issuing Org").
    
    Return all data in the structured JSON format.
  `;

  const prompt = `
    User Profile Data:
    - Full Name: ${userInfo.fullName}
    - Job Title (Target/Current): ${userInfo.jobTitle}
    - Company (Current): ${userInfo.company}
    - Location: ${userInfo.location}
    - University: ${userInfo.university}
    - Degree: ${userInfo.degree}
    - Languages: ${userInfo.languages}
    - Soft Skills Input: ${userInfo.softSkills}
    - Hard Skills Input: ${userInfo.hardSkills}
    - Certifications Input: ${userInfo.certifications}

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