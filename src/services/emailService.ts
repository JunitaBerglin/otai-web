import type { ReferralForm } from "../types/types";

// EmailJS configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

// Fallback email configuration
const THERAPIST_EMAIL =
  import.meta.env.VITE_THERAPIST_EMAIL || "arbetsterapeut@otai.se";

interface EmailResult {
  success: boolean;
  error?: string;
}

/**
 * Send a referral form to the occupational therapist team
 */
export async function sendReferral(
  referral: ReferralForm
): Promise<EmailResult> {
  try {
    // Validate EmailJS configuration
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.warn("EmailJS not configured. Would send referral:", referral);
      return {
        success: false,
        error: "Email-tjänsten är inte konfigurerad. Kontakta support.",
      };
    }

    // Dynamically import EmailJS only when needed
    const emailjs = await import("@emailjs/browser");

    // Format the email content
    const emailParams = {
      to_email: THERAPIST_EMAIL,
      subject: `Ny Remiss: ${referral.patientInfo.name} (${getUrgencyText(
        referral.urgency
      )})`,
      patient_name: referral.patientInfo.name,
      patient_email: referral.patientInfo.email,
      patient_phone: referral.patientInfo.phone,
      patient_age: referral.patientInfo.age || "Ej angivet",
      patient_address: referral.patientInfo.address || "Ej angivet",

      primary_challenge: referral.challenges.primary,
      challenge_duration: referral.challenges.duration || "Ej angivet",
      challenge_impact: referral.challenges.impact,
      secondary_challenges: referral.challenges.secondary?.join(", ") || "Inga",

      urgency: getUrgencyText(referral.urgency),
      urgency_reason: referral.urgencyReason || "Ej angivet",

      needs_physical_aids: referral.needs.physicalAids ? "Ja" : "Nej",
      physical_aids_list:
        referral.needs.physicalAidsList?.join(", ") || "Ej specificerat",
      needs_home_visit: referral.needs.homeVisit ? "Ja" : "Nej",
      needs_workplace_visit: referral.needs.workplaceVisit ? "Ja" : "Nej",
      needs_follow_up: referral.needs.followUp ? "Ja" : "Nej",
      other_needs: referral.needs.other || "Inga",

      conversation_message_count: referral.conversationSummary.messageCount,
      conversation_topics:
        referral.conversationSummary.mainTopics.join(", ") ||
        "Inga identifierade",
      conversation_suggestions:
        referral.conversationSummary.aiSuggestionsTried.join(", ") || "Inga",
      conversation_text: formatConversationForEmail(
        referral.conversationSummary.conversationText || ""
      ),

      additional_notes:
        referral.additionalNotes || "Inga ytterligare kommentarer",

      created_at: new Date(referral.createdAt).toLocaleString("sv-SE"),
      referral_id: referral.id,
    };

    // Send email via EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      emailParams,
      EMAILJS_PUBLIC_KEY
    );

    if (response.status === 200) {
      console.log("Referral sent successfully:", referral.id);
      return { success: true };
    } else {
      console.error("EmailJS response not OK:", response);
      return {
        success: false,
        error: "Det gick inte att skicka remissen. Försök igen senare.",
      };
    }
  } catch (error) {
    console.error("Error sending referral:", error);
    return {
      success: false,
      error:
        "Ett oväntat fel uppstod. Kontrollera din internetanslutning och försök igen.",
    };
  }
}

/**
 * Format conversation text for email (truncate if too long)
 */
function formatConversationForEmail(conversationText: string): string {
  const maxLength = 5000; // Max characters for email
  if (conversationText.length <= maxLength) {
    return conversationText;
  }
  return (
    conversationText.substring(0, maxLength) +
    "\n\n[Konversationen är trunkerad på grund av längd. Fullständig konversation finns i OTAI-systemet.]"
  );
}

/**
 * Get human-readable urgency text
 */
function getUrgencyText(urgency: "low" | "medium" | "high"): string {
  switch (urgency) {
    case "low":
      return "Låg (2-4 veckor)";
    case "medium":
      return "Medel (1-2 veckor)";
    case "high":
      return "Hög (inom några dagar)";
    default:
      return "Ej angiven";
  }
}

/**
 * Generate a formatted plain text email body (fallback if EmailJS template fails)
 */
export function generateReferralEmailBody(referral: ReferralForm): string {
  return `
NY REMISS FRÅN OTAI
===================

PATIENTINFORMATION
------------------
Namn: ${referral.patientInfo.name}
E-post: ${referral.patientInfo.email}
Telefon: ${referral.patientInfo.phone}
Ålder: ${referral.patientInfo.age || "Ej angivet"}
Adress: ${referral.patientInfo.address || "Ej angivet"}

UTMANINGAR
----------
Huvudsaklig utmaning:
${referral.challenges.primary}

Varaktighet: ${referral.challenges.duration || "Ej angivet"}

Påverkan på vardagen:
${referral.challenges.impact}

${
  referral.challenges.secondary && referral.challenges.secondary.length > 0
    ? `
Sekundära utmaningar:
${referral.challenges.secondary.map((c) => `- ${c}`).join("\n")}
`
    : ""
}

BEHOV
-----
Fysiska hjälpmedel: ${referral.needs.physicalAids ? "JA" : "NEJ"}
${
  referral.needs.physicalAidsList && referral.needs.physicalAidsList.length > 0
    ? `  - ${referral.needs.physicalAidsList.join(", ")}`
    : ""
}
Hembesök: ${referral.needs.homeVisit ? "JA" : "NEJ"}
Arbetsplatsbesök: ${referral.needs.workplaceVisit ? "JA" : "NEJ"}
Uppföljning: ${referral.needs.followUp ? "JA" : "NEJ"}
${referral.needs.other ? `Övrigt: ${referral.needs.other}` : ""}

BRÅDSKANDE
----------
Nivå: ${getUrgencyText(referral.urgency)}
${referral.urgencyReason ? `Anledning: ${referral.urgencyReason}` : ""}

KONVERSATION MED OTAI
---------------------
Antal meddelanden: ${referral.conversationSummary.messageCount}
Huvudämnen: ${
    referral.conversationSummary.mainTopics.join(", ") || "Inga identifierade"
  }
AI-förslag som prövats: ${
    referral.conversationSummary.aiSuggestionsTried.join(", ") || "Inga"
  }

Fullständig konversation:
${formatConversationForEmail(
  referral.conversationSummary.conversationText || ""
)}

${
  referral.additionalNotes
    ? `
YTTERLIGARE KOMMENTARER
-----------------------
${referral.additionalNotes}
`
    : ""
}

METADATA
--------
Remiss-ID: ${referral.id}
Skapad: ${new Date(referral.createdAt).toLocaleString("sv-SE")}
Samtycke givet: ${referral.consentGiven ? "Ja" : "Nej"}${
    referral.consentTimestamp
      ? ` (${new Date(referral.consentTimestamp).toLocaleString("sv-SE")})`
      : ""
  }
`;
}
