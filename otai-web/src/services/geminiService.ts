import { GoogleGenerativeAI } from "@google/generative-ai";
import type { message } from "../types/types";

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn(
    "VITE_GEMINI_API_KEY saknas i miljövariabler. AI-funktionalitet kommer inte fungera."
  );
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// System prompt för OTAI - Arbetsterapeutisk AI-assistent
const SYSTEM_PROMPT = `Du är OTAI, en AI-assistent specialiserad på arbetsterapi och rehabilitering. 

DIN ROLL:
- Du hjälper användare med arbetsterapeutiska råd och förslag
- Du är empatisk, professionell och lättförståelig
- Du ger praktiska, konkreta förslag som kan tillämpas i vardagen
- Du arbetar utifrån arbetsterapeutiska principer och metoder

DINA KUNSKAPSOMRÅDEN:
- Dagliga aktiviteter (ADL) och instrumentella dagliga aktiviteter (IADL)
- Ergonomi och anpassningar i hem och arbetsmiljö
- Hjälpmedel och kompensatoriska strategier
- Kognitiva svårigheter och strategier för minneshjälp
- Sensorisk integration och reglering
- Arbetsmiljö och arbetsanpassningar
- Barn och pedagogisk arbetsterapi
- Äldre och gerontologi
- Psykisk hälsa och aktivitetsbalans

KOMMUNIKATIONSSTIL:
- Använd svenska
- Var vänlig och uppmuntrande
- Ge konkreta exempel
- Bryt ner komplexa problem i hanterbara delar
- Fråga följdfrågor när du behöver mer information
- Var tydlig med att du är en AI och inte ersätter legitimerad arbetsterapeut

VIKTIGT:
- Ge ALLTID en påminnelse att dina råd är generella och inte ersätter professionell bedömning
- Vid medicinska frågor eller allvarliga problem, hänvisa till läkare eller legitimerad arbetsterapeut
- Fokusera på praktiska lösningar som användaren kan genomföra själv
- Ge 2-4 konkreta förslag per svar
- Följ upp med frågor för att förstå situationen bättre

Svara alltid på svenska och var hjälpsam!`;

export const sendMessageToGemini = async (
  userMessage: string,
  chatHistory: message[] = []
): Promise<string> => {
  if (!genAI) {
    throw new Error(
      "Gemini API är inte konfigurerad. Lägg till VITE_GEMINI_API_KEY i .env-filen."
    );
  }

  try {
    // Use Gemini 1.5 Flash for fast, free responses
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build conversation history
    const conversationHistory = chatHistory
      .slice(-10)
      .map((msg) => {
        const role =
          typeof msg.role === "object" && msg.role.email ? "user" : "model";
        return `${role}: ${msg.content}`;
      })
      .join("\n");

    // Combine system prompt with conversation history and new message
    const fullPrompt = `${SYSTEM_PROMPT}

TIDIGARE KONVERSATION:
${conversationHistory}

NYTT MEDDELANDE FRÅN ANVÄNDARE:
${userMessage}

Svara nu som OTAI, den arbetsterapeutiska AI-assistenten:`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Gemini API error:", error);

    // Handle specific error cases
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("API_KEY")) {
      throw new Error(
        "API-nyckeln är ogiltig. Kontrollera VITE_GEMINI_API_KEY i .env-filen."
      );
    }

    if (errorMessage.includes("quota")) {
      throw new Error(
        "API-kvoten är överskriden. Försök igen senare eller kontakta support."
      );
    }

    throw new Error(
      "Kunde inte få svar från AI-assistenten. Försök igen om ett ögonblick."
    );
  }
};

// Helper function to check if API is configured
export const isGeminiConfigured = (): boolean => {
  return !!API_KEY;
};
