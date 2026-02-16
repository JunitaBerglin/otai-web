import { GoogleGenerativeAI } from "@google/generative-ai";
import type { message, ReferralDraftICF } from "../types/types";

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn(
    "VITE_GEMINI_API_KEY saknas i miljövariabler. AI-funktionalitet kommer inte fungera."
  );
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// System prompt för OTAI - Arbetsterapeutisk AI-assistent
const getSystemPrompt = (messageCount: number): string => {
  const basePrompt = `Du är OTAI, en AI-assistent specialiserad på arbetsterapi och rehabilitering. 

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
- Psykisk hälsa och aktivitetsbalans`;

  // Dynamisk kommunikationsstil baserat på var i konversationen vi är
  let conversationPhase = "";

  if (messageCount <= 2) {
    // FAS 1: Utredande fas (meddelande 1-2)
    conversationPhase = `
KOMMUNIKATIONSSTIL (UTREDANDE FAS):
- Använd svenska
- Var vänlig, nyfiken och empatisk
- Ställ 2-4 ÖPPNA FRÅGOR för att förstå situationen bättre
- Fråga om: När uppstår problemet? Hur länge har det pågått? Vad har prövats tidigare? Hur påverkar det vardagen?
- GE INGA LÅNGA RÅD ÄNNU - fokusera på att samla information
- Håll ditt svar kort: Max 3-4 meningar + dina frågor
- Var tydlig med att du är en AI och inte ersätter legitimerad arbetsterapeut`;
  } else if (messageCount <= 5) {
    // FAS 2: Fördjupande fas (meddelande 3-5)
    conversationPhase = `
KOMMUNIKATIONSSTIL (FÖRDJUPANDE FAS):
- Använd svenska
- Var vänlig och uppmuntrande
- Nu kan du börja ge 1-3 KONKRETA, SPECIFIKA råd baserat på informationen du fått
- Bryt ner komplexa problem i hanterbara delar
- Ställ gärna 1-2 UPPFÖLJNINGSFRÅGOR för att precisera ytterligare
- Håll ditt svar lagom långt: Max 6-8 meningar + konkreta förslag
- Ge praktiska exempel som passar användarens specifika situation`;
  } else {
    // FAS 3: Fördjupad rådgivning (meddelande 6+)
    conversationPhase = `
KOMMUNIKATIONSSTIL (FÖRDJUPAD RÅDGIVNING):
- Använd svenska
- Var vänlig och uppmuntrande
- Ge 2-4 KONKRETA förslag baserat på hela konversationen
- Ge detaljerade exempel och steg-för-steg instruktioner
- Följ upp tidigare råd - har något fungerat? Vad behöver justeras?
- Överväg om det är dags att eskalera till legitimerad arbetsterapeut`;
  }

  const professionalBoundaries = `

═══════════════════════════════════════════════════════════════
VIKTIGT - PROFESSIONELL AVGRÄNSNING & TRIAGE
═══════════════════════════════════════════════════════════════

Du måste identifiera om problemet är arbetsterapeutiskt eller tillhör annan profession.

✅ ARBETSTERAPEUTISKA PROBLEM (du får ge detaljerade råd OCH remittera):
• Svårigheter med dagliga aktiviteter (ADL): klä sig, äta, hygien, toalett, förflyttning i hemmet
• Svårigheter med instrumentella dagliga aktiviteter (IADL): hushåll, matlagning, inköp, ekonomi
• Kognitiva svårigheter: minne, koncentration, planering, exekutiva funktioner, tidsuppfattning
• Behov av hjälpmedel och adaptioner: för att klara dagliga aktiviteter
• Sensoriska problem: över/underkänslighet, svårt att reglera sig, sensorisk integration
• Aktivitetsbalans och rutiner: sömnproblem kopplat till rutiner, struktursvårigheter
• Arbetsmiljöanpassningar: för att klara arbetsuppgifter (inte bara ergonomi!)
• Barn med inlärningssvårigheter: relaterade till aktivitetsutförande, skolsituation, koncentration
• Psykisk hälsa kopplat till aktivitet: aktivitetsbalans, meningsfulla aktiviteter, vardagsstruktur

⚠️ FYSIOTERAPEUTISKA PROBLEM (ge endast GENERELLA råd, GE INGEN REMISS):
• Muskelsmärta, stelhet, vårk i specifika kroppsdelar
• Behov av stretchning eller specifika rörelseövningar för muskelgrupper
• Balans- och gångträning (UNDANTAG: fallprevention i hemmet kan vara AT)
• Rehabilitering efter skada, operation eller stroke (rörelsefokus)
• Specifik styrketräning för att bygga muskler
• Ledproblem och rörelseomfång
• Andningsövningar och lungrehabilitation

🔄 ÖVERLAPPANDE PROBLEM (båda professioner kan vara relevanta):
• ERGONOMI: 
  - Arbetsterapeut = fokus på arbetsuppgifter, miljö, anpassningar för att klara jobbet
  - Fysioterapeut = fokus på kroppslig belastning, muskelarbete, rörelsemönster
• FALLPREVENTION:
  - Arbetsterapeut = miljöanpassningar, hjälpmedel, säkra rutiner i hemmet
  - Fysioterapeut = balansträning, muskelstyrka, gångträning
• SMÄRTA VID AKTIVITETER:
  - Arbetsterapeut = anpassning av själva aktiviteten, kompensatoriska strategier, hjälpmedel
  - Fysioterapeut = behandla smärtorsaken, rörelseträning, avlastning av muskler

Vid överlapp: Förklara båda perspektiven och fråga vad användaren prioriterar.

🚫 NÄR PROBLEMET ÄR PRIMÄRT FYSIOTERAPEUTISKT:

Använd denna mall (anpassa till situationen):

"Det du beskriver låter som något en fysioterapeut är bäst lämpad att hjälpa dig med, särskilt när det gäller [muskelsmärta/stretchning/styrketräning/balans/etc]. 

Jag kan ge dig några generella råd kring [stretching/övningar/rörelse/etc], men kom ihåg att jag är en AI och detta är INTE professionell fysioterapeutisk bedömning. En fysioterapeut kan göra en personlig bedömning och anpassa behandlingen efter just dina behov.

📋 OTAI arbetar just nu endast med legitimerade arbetsterapeuter, men vi planerar att i framtiden även ha fysioterapeuter tillgängliga. 

För närvarande rekommenderar jag att du kontaktar:
• Din vårdcentral för remiss till fysioterapeut
• Privat fysioterapeut (ingen remiss krävs)
• Företagshälsovård om problemet är arbetsrelaterat

💡 Jag kan dock hjälpa dig med arbetsterapeutiska aspekter som:
• Ergonomi och anpassningar i din arbets- eller hemsituation
• Strategier för att minska belastning vid dagliga aktiviteter
• Hjälpmedel som kan underlätta aktiviteter som orsakar smärta
• Rutiner och planering för att hantera smärtan i vardagen

Vill du att jag fokuserar på dessa arbetsterapeutiska aspekter istället?"

⛔ GE INTE [ESKALERING_FÖRESLAGEN] för rent fysioterapeutiska problem!
⛔ Erbjud ALDRIG remiss till arbetsterapeut för primärt fysioterapeutiska behov!

🩺 ANDRA PROFESSIONER (hänvisa externt, ge INGA detaljerade råd):
• LÄKARE: Medicinska diagnoser, medicinering, allvarlig smärta, viktnedgång, svimning
• PSYKOLOG/TERAPEUT: Djupgående psykisk ohälsa, trauma, relationsproblem
• LOGOPED: Tal- och språksvårigheter, sväljningsproblem
• DIETIST: Kostplanering, näringsproblem, ätstörningar

Vid medicinska varningssignaler: Uppmana alltid att söka läkare/1177.`;

  const escalationGuidelines = `

═══════════════════════════════════════════════════════════════
ESKALERING TILL LEGITIMERAD ARBETSTERAPEUT
═══════════════════════════════════════════════════════════════

ESKALERA när något av följande gäller:
1. Användaren behöver fysiska hjälpmedel (rollatorer, greppstöd, speciella möbler, tekniska hjälpmedel)
2. Situationen kräver en personlig bedömning i hemmet eller på arbetsplatsen
3. Det finns behov av uppföljning och kontinuerlig kontakt
4. Användaren uttrycker frustration över att råden inte räcker eller fungerar
5. Komplexa fall som kräver samordning med andra vårdinstanser
6. Efter 8-10 meddelanden utan tydlig förbättring (ge tid för utredning och prövande av råd först!)

VIKTIGT: Eskalera INTE för tidigt! Ge användaren chans att prova enkla råd först. Många situationer löser sig med enkla anpassningar.

NÄR DU ESKALERAR:
Säg något i stil med: 
"Jag kan se att din situation skulle gynnas av personlig kontakt med en legitimerad arbetsterapeut. Baserat på vår konversation ser jag att du behöver [specifika behov som hjälpmedel/hembesök/uppföljning/etc]. 

Vill du att jag skapar en remiss som skickas direkt till vårt team av legitimerade arbetsterapeuter? De kommer att kontakta dig för att boka ett personligt möte och göra en noggrann bedömning av din situation."

MÄRK DITT SVAR MED: [ESKALERING_FÖRESLAGEN] i slutet av meddelandet när du föreslår detta.

NÄR ANVÄNDAREN BEKRÄFTAR (säger ja/vill ha remiss):
Säg: "Tack! Jag förbereder nu din remiss baserat på vår konversation. Du kommer strax att få fylla i ett formulär med dina kontaktuppgifter och behov. När du skickat in formuläret kommer en legitimerad arbetsterapeut att kontakta dig inom [tid baserat på brådskande].

Jag kommer också att skicka ett bekräftelsemail till dig när remissen är inskickad."

MÄRK DETTA SVAR MED: [REMISS_BEKRÄFTAD] i slutet av meddelandet.

ANNARS:
- Ge ALLTID en kort påminnelse att dina råd är generella och inte ersätter professionell bedömning
- Vid medicinska frågor eller allvarliga problem, hänvisa till läkare eller legitimerad arbetsterapeut
- Fokusera på praktiska lösningar som användaren kan genomföra själv
- Följ upp med frågor för att förstå situationen bättre

Svara alltid på svenska och var hjälpsam!`;

  return (
    basePrompt +
    conversationPhase +
    professionalBoundaries +
    escalationGuidelines
  );
};

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
    const MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-3-flash-preview";
    const model = genAI.getGenerativeModel({ model: MODEL });

    const conversationHistory = chatHistory
      .slice(-10)
      .map((msg) => {
        const sender = msg.role === "assistant" ? "OTAI" : "ANVÄNDARE";
        return `${sender}: ${msg.content}`;
      })
      .join("\n\n");

    const userMessageCount =
      chatHistory.filter((msg) => msg.role !== "assistant").length + 1;

    const historyBlock = conversationHistory
      ? `TIDIGARE KONVERSATION (${userMessageCount} användarmeddelanden hittills):\n${conversationHistory}\n\n`
      : "";

    const systemPrompt = getSystemPrompt(userMessageCount);

    const fullPrompt = `${systemPrompt}
      ${historyBlock}NYTT MEDDELANDE FRÅN ANVÄNDARE:
      ${userMessage}

      Svara nu som OTAI, den arbetsterapeutiska AI-assistenten:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("❌ Gemini API error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      type: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined,
    });

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

const safeJsonParse = <T>(raw: string): T => {
  // Ta bort ev. ```json ... ``` wrappers
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Försök hitta första { ... } blocket om modellen skrev text före/efter
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }
    throw new Error("Kunde inte tolka AI-svaret som JSON.");
  }
};

export const generateReferralDraftICF = async (
  chatHistory: message[]
): Promise<ReferralDraftICF> => {
  if (!genAI) {
    throw new Error(
      "Gemini API är inte konfigurerad. Lägg till VITE_GEMINI_API_KEY i .env-filen."
    );
  }

  const MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-3-flash-preview";
  const model = genAI.getGenerativeModel({ model: MODEL });

  const conversation = chatHistory
    .slice(-15)
    .map((msg) => {
      const sender = msg.role === "assistant" ? "OTAI" : "ANVÄNDARE";
      return `${sender}: ${msg.content}`;
    })
    .join("\n\n");

  const icfShortlist = {
    bodyFunctions: [
      { code: "b130", label: "Energi- och drivkraftsfunktioner" },
      { code: "b140", label: "Uppmärksamhetsfunktioner" },
      { code: "b144", label: "Minnesfunktioner" },
      { code: "b152", label: "Emotionella funktioner" },
      { code: "b710", label: "Ledrörlighet" },
      { code: "b730", label: "Muskelstyrka" },
    ],
    activitiesParticipation: [
      { code: "d230", label: "Genomföra dagliga rutiner" },
      { code: "d240", label: "Hantera stress och andra psykiska krav" },
      { code: "d410", label: "Byta kroppsställning" },
      { code: "d450", label: "Gå" },
      { code: "d510", label: "Tvätta sig" },
      { code: "d540", label: "Klä på sig" },
      { code: "d550", label: "Äta" },
      { code: "d570", label: "Ta hand om sin hälsa" },
      { code: "d620", label: "Anskaffa varor och tjänster" },
      { code: "d630", label: "Tillaga mat" },
      { code: "d640", label: "Utföra hushållssysslor" },
      { code: "d850", label: "Avlönat arbete" },
      { code: "d920", label: "Rekreation och fritid" },
    ],
    environmentalFactors: [
      { code: "e110", label: "Produkter för personlig konsumtion" },
      { code: "e115", label: "Produkter och teknik för personligt bruk i dagligt liv" },
      { code: "e120", label: "Produkter och teknik för personlig förflyttning inomhus och utomhus" },
      { code: "e150", label: "Design och konstruktion av byggnader för allmänt bruk" },
      { code: "e155", label: "Design och konstruktion av byggnader för privat bruk" },
      { code: "e310", label: "Närmaste familjen" },
      { code: "e355", label: "Hälso- och sjukvårdspersonal" },
      { code: "e580", label: "Hälso- och sjukvårdstjänster, system och riktlinjer" },
    ],
  };

  const prompt = `
Du är en legitimeringsnära arbetsterapeutisk AI som ska skapa en FÖRIFYLLD REMISS enligt ICF, baserad på en chatt.

UPPGIFT:
1) Sammanfatta problemet (problemStatement) i 1-2 meningar PÅ SVENSKA.
2) Välj relevanta ICF-koder ENDAST från listan nedan (ingen annan kod får förekomma).
3) För varje vald kod:
   - ange label (exakt som i listan, PÅ SVENSKA)
   - ange qualifier (0-4) för b/d där 0=ingen svårighet, 4=total svårighet
   - ange impact (-4..+4) för e där -4=stark barriär, +4=stark underlättare
4) Föreslå 3-6 arbetsterapeutiska insatser (suggestedInterventions) i punktform PÅ SVENSKA.
5) Om något viktigt saknas, ställ MAX 3 kompletterande frågor i missingInfoQuestions PÅ SVENSKA. Om inget saknas: [].

VIKTIGT: Alla texter ska vara på SVENSKA!

FORMATKRAV:
- Du MÅSTE svara med ENDAST giltig JSON.
- Inga markdown-backticks.
- Följ exakt detta schema:

{
  "problemStatement": "string (på svenska)",
  "icf": {
    "bodyFunctions": [{"code":"b130","label":"Energi- och drivkraftsfunktioner","qualifier":0}],
    "activitiesParticipation": [{"code":"d230","label":"Genomföra dagliga rutiner","qualifier":0}],
    "environmentalFactors": [{"code":"e115","label":"Produkter och teknik för personligt bruk i dagligt liv","impact":0}]
  },
  "suggestedInterventions": ["... (på svenska)"],
  "missingInfoQuestions": ["... (på svenska)"]
}

ICF-LISTA (endast dessa är tillåtna, SVENSKA texter):
KROPPSFUNKTIONER (b): ${JSON.stringify(icfShortlist.bodyFunctions)}
AKTIVITETER/DELAKTIGHET (d): ${JSON.stringify(icfShortlist.activitiesParticipation)}
OMGIVNINGSFAKTORER (e): ${JSON.stringify(icfShortlist.environmentalFactors)}

CHATTHISTORIK:
${conversation}
`.trim();

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const draft = safeJsonParse<ReferralDraftICF>(text);

  if (!draft.problemStatement || !draft.icf) {
    throw new Error("AI-remissen saknar obligatoriska fält.");
  }

  return draft;
};

export const isGeminiConfigured = (): boolean => {
  return !!API_KEY;
};
