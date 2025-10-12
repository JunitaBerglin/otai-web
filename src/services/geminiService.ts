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
- Du är en FÖRSTA BEDÖMNING innan legitimerade arbetsterapeuter tar över
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

VIKTIGT - ESKALERING TILL LEGITIMERAD ARBETSTERAPEUT:
Du har en viktig gräns för när du ska eskalera ärendet vidare:

ESKALERA ALLTID när något av följande gäller:
1. Användaren behöver fysiska hjälpmedel (rollatorer, greppstöd, speciella möbler, tekniska hjälpmedel)
2. Situationen kräver en personlig bedömning i hemmet eller på arbetsplatsen
3. Det finns behov av uppföljning och kontinuerlig kontakt
4. Användaren uttrycker frustration över att råden inte räcker
5. Komplexa fall som kräver samordning med andra vårdinstanser
6. Efter 5-7 meddelanden utan tydlig förbättring

NÄR DU ESKALERAR:
Säg något i stil med: 
"Jag kan se att din situation skulle gynnas av personlig kontakt med en legitimerad arbetsterapeut. De kan göra en noggrann bedömning och hjälpa dig med [specifika behov som hjälpmedel/uppföljning/etc]. 

Vill du att jag skapar en remiss som skickas direkt till vårt team av legitimerade arbetsterapeuter? De kommer att kontakta dig inom [tidsram] för att boka ett personligt möte."

MÄRK DITT SVAR MED: [ESKALERING_FÖRESLAGEN] i slutet av meddelandet när du föreslår detta.

ANNARS:
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
    console.log("🔑 API Key finns:", !!API_KEY);
    console.log(
      "📝 Skickar meddelande till Gemini:",
      userMessage.substring(0, 50) + "..."
    );

    // Use Gemini 2.5 Flash - latest model with best price/performance
    // Perfect for high-volume, low-latency tasks
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

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

    console.log("🚀 Anropar Gemini API...");

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    console.log(
      "✅ Svar mottaget från Gemini:",
      text.substring(0, 100) + "..."
    );

    return text;
  } catch (error) {
    console.error("❌ Gemini API error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      type: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Handle specific error cases
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("API_KEY") || errorMessage.includes("API key")) {
      throw new Error(
        "API-nyckeln är ogiltig. Kontrollera VITE_GEMINI_API_KEY i .env-filen."
      );
    }

    if (errorMessage.includes("quota") || errorMessage.includes("429")) {
      throw new Error(
        "API-kvoten är överskriden. Försök igen senare eller kontakta support."
      );
    }

    if (errorMessage.includes("403") || errorMessage.includes("permission")) {
      throw new Error(
        "API-nyckeln har inte rätt behörigheter. Kontrollera att nyckeln är aktiverad för Generative Language API."
      );
    }

    throw new Error(`Kunde inte få svar från AI-assistenten: ${errorMessage}`);
  }
};

// Helper function to check if API is configured
export const isGeminiConfigured = (): boolean => {
  return !!API_KEY;
};
