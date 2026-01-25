import type { ReferralDraftICF, ReferralForm } from "../types/types";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

const THERAPIST_EMAIL =
  import.meta.env.VITE_THERAPIST_EMAIL || "otairemiss@gmail.com";

interface EmailResult {
  success: boolean;
  error?: string;
}

export async function sendReferral(referral: ReferralForm): Promise<EmailResult> {
  try {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.warn("EmailJS not configured. Would send referral:", referral);
      return {
        success: false,
        error: "Email-tjänsten är inte konfigurerad. Kontakta support.",
      };
    }

    if (!THERAPIST_EMAIL.includes("@")) {
      return { success: false, error: "Felaktig mottagaradress för remiss." };
    }

    const emailjs = await import("@emailjs/browser");

    const subject = `Ny Remiss: ${referral.patientInfo.name} (${getUrgencyText(
      referral.urgency
    )})`;

    function formatIcfDraft(d: ReferralDraftICF): string {
      const lines: string[] = [];
      lines.push(`ICF-OPTIMERAD HANDOVER (AUTOGENERERAD)`);
      lines.push(`Problem: ${d.problemStatement}`);
      lines.push("");
    
      lines.push("b – Kroppsfunktioner:");
      d.icf.bodyFunctions.forEach(x => lines.push(`- ${x.code} ${x.label} (q${x.qualifier})`));
      lines.push("");
    
      lines.push("d – Aktiviteter/Delaktighet:");
      d.icf.activitiesParticipation.forEach(x => lines.push(`- ${x.code} ${x.label} (q${x.qualifier})`));
      lines.push("");
    
      lines.push("e – Omgivningsfaktorer:");
      d.icf.environmentalFactors.forEach(x => lines.push(`- ${x.code} ${x.label} (impact ${x.impact})`));
      lines.push("");
    
      lines.push("Föreslagna arbetsterapeutiska insatser:");
      d.suggestedInterventions.forEach(s => lines.push(`- ${s}`));
      lines.push("");
    
      if (d.missingInfoQuestions?.length) {
        lines.push("Kompletterande frågor (vid behov):");
        d.missingInfoQuestions.forEach(q => lines.push(`- ${q}`));
        lines.push("");
      }
    
      return lines.join("\n");
    }    

    const emailParams = {
      to_email: THERAPIST_EMAIL,
      subject,

      name: referral.patientInfo.name,
      title: subject,

      patient_name: referral.patientInfo.name,
      patient_email: referral.patientInfo.email,
      patient_phone: referral.patientInfo.phone,
      patient_age: referral.patientInfo.age || "Ej angivet",
      patient_address: referral.patientInfo.address || "Ej angivet",
      icf_block: referral.icfDraft ? formatIcfDraft(referral.icfDraft) : "ICF-analys saknas (kunde ej genereras).",
      
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
        referral.conversationSummary.mainTopics.join(", ") || "Inga identifierade",
      conversation_suggestions:
        referral.conversationSummary.aiSuggestionsTried.join(", ") || "Inga",
      conversation_text: formatConversationForEmail(
        referral.conversationSummary.conversationText || ""
      ),

      additional_notes: referral.additionalNotes || "Inga ytterligare kommentarer",

      created_at: new Date(referral.createdAt).toLocaleString("sv-SE"),
      referral_id: referral.id,
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      emailParams,
      EMAILJS_PUBLIC_KEY
    );

    if (response.status === 200 || response.text === "OK") {
      console.log("Referral sent successfully:", referral.id);
      return { success: true };
    }

    console.error("EmailJS response not OK:", response);
    return {
      success: false,
      error: "Det gick inte att skicka remissen. Försök igen senare.",
    };
  } catch (error) {
    console.error("Error sending referral:", error);
    return {
      success: false,
      error:
        "Ett oväntat fel uppstod. Kontrollera din internetanslutning och försök igen.",
    };
  }
}

function formatConversationForEmail(conversationText: string): string {
  const maxLength = 5000;
  if (conversationText.length <= maxLength) return conversationText;
  return (
    conversationText.substring(0, maxLength) +
    "\n\n[Konversationen är trunkerad på grund av längd.]"
  );
}

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
