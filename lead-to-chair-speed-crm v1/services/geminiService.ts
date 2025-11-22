
import { GoogleGenAI } from "@google/genai";
import { Lead, LeadSource } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize globally to avoid recreation, but handle missing key gracefully in functions
const ai = new GoogleGenAI({ apiKey });

export const generateWhatsAppScript = async (lead: Lead): Promise<string> => {
  if (!apiKey) return `Hello ${lead.name}, regarding your message about ${lead.treatmentInterest}, we are happy to help! When can you visit?`;

  try {
    let contextPrompt = "";
    // Context: The client initiated the conversation. We are REPLYING.
    if (lead.initialMessage) {
      contextPrompt = `
        SITUATION: The patient has ALREADY sent us a message: "${lead.initialMessage}".
        YOUR GOAL: Write a specific REPLY to their message. Answer their question or acknowledge their pain/need immediately.
        TONE: Warm, reassuring, and ready to help.
      `;
    } else if (lead.source === LeadSource.GOOGLE_ADS) {
      contextPrompt = `
        SITUATION: The patient clicked a 'Book Appointment' button on a Google Ad for ${lead.treatmentInterest}.
        YOUR GOAL: Acknowledge their interest and offer an immediate slot.
      `;
    } else {
      contextPrompt = "SITUATION: This is a manual entry. We are initiating contact.";
    }

    const prompt = `
      You are a senior patient coordinator at a prestigious dental clinic in Oman.
      
      Patient Name: ${lead.name}
      Interest: ${lead.treatmentInterest}
      ${contextPrompt}
      
      CULTURAL NUANCES: 
      - Omanis value personal connection and politeness. 
      - Use "Salam" or "Hello" warmly.
      - If they complained of pain, be empathetic first.
      
      CONSTRAINTS:
      - Keep it short (WhatsApp style).
      - End with a low-friction question (e.g., "Do you prefer mornings or evenings?").
      - Sign off as "The Dental Team".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Hello! We received your message. How can we assist you today?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Hello ${lead.name}, received your inquiry about ${lead.treatmentInterest}. How can we help?`;
  }
};

export const analyzePerformance = async (leads: Lead[], spend: number): Promise<string> => {
  if (!apiKey) return "Add API Key for AI insights.";

  const total = leads.length;
  const booked = leads.filter(l => l.status === 'BOOKED').length;
  const newLeads = leads.filter(l => l.status === 'NEW').length;
  const websiteLeads = leads.filter(l => l.source === LeadSource.WEBSITE).length;

  try {
    const prompt = `
      Analyze this dental clinic performance data.
      Total Spend: ${spend} OMR
      Total Leads: ${total} (${websiteLeads} from Website, rest from Ads)
      Booked Patients: ${booked}
      Uncontacted (New) Leads: ${newLeads}

      Provide a 2-sentence executive summary for the dentist. 
      Mention which channel (Website vs Ads) seems to be working if possible (assume website is high quality).
      Tone: Encouraging but business-focused.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Data available in dashboard.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate AI insight at this moment.";
  }
};

export const generateMarketingCampaign = async (patients: Lead[], goal: string): Promise<string> => {
  if (!apiKey) return "Please configure API Key to use AI Marketing features.";

  try {
    // Extract commonalities
    const interests = [...new Set(patients.map(p => p.treatmentInterest))].join(', ');
    const namesSample = patients.slice(0, 3).map(p => p.name).join(', ');

    const prompt = `
      You are a Marketing Expert for a high-end Dental Clinic in Oman.
      
      TASK: Write a WhatsApp Broadcast message for a selected group of ${patients.length} patients.
      
      AUDIENCE PROFILE:
      - Interests: ${interests}
      - Sample Names: ${namesSample} (Do not use specific names in the script, keep it generic or use [Name] placeholder).
      
      CAMPAIGN GOAL: "${goal}"
      
      REQUIREMENTS:
      - Tone: Professional, warm, and exclusive (not spammy).
      - Structure: Hook -> Value Proposition -> Call to Action.
      - Format: WhatsApp friendly (short paragraphs, emojis).
      - Language: English (with a touch of local hospitality).
      
      OUTPUT: Just the message text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Error generating campaign.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate campaign.";
  }
};
