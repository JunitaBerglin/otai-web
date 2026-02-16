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
    console.log("🔧 Attempting to send referral...");
    console.log("EmailJS Config:", {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID,
      publicKey: EMAILJS_PUBLIC_KEY ? "SET" : "MISSING",
      therapistEmail: THERAPIST_EMAIL
    });

    // Validate configuration
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error("❌ EmailJS not configured properly");
      return {
        success: false,
        error: "Email-tjänsten är inte konfigurerad. Kontakta support på otairemiss@gmail.com.",
      };
    }

    if (!THERAPIST_EMAIL.includes("@")) {
      console.error("❌ Invalid therapist email");
      return { success: false, error: "Felaktig mottagaradress för remiss." };
    }

    // Dynamically import EmailJS to avoid build issues
    const emailjs = await import("@emailjs/browser");
    console.log("✅ EmailJS loaded successfully");

    // Initialize EmailJS with public key
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log("✅ EmailJS initialized with public key");

    const subject = `Ny Remiss: ${referral.patientInfo.name} (${getUrgencyText(
      referral.urgency
    )})`;

    function formatIcfDraft(d: ReferralDraftICF): string {
      const lines: string[] = [];
      lines.push(`═══════════════════════════════════════`);
      lines.push(`ICF-OPTIMERAD BEDÖMNING (AUTOGENERERAD)`);
      lines.push(`═══════════════════════════════════════`);
      lines.push("");
      lines.push(`📋 PROBLEMFORMULERING:`);
      lines.push(`${d.problemStatement}`);
      lines.push("");
    
      lines.push(`🧠 KROPPSFUNKTIONER (b):`);
      if (d.icf.bodyFunctions.length > 0) {
        d.icf.bodyFunctions.forEach(x => {
          const severity = x.qualifier === 0 ? "ingen svårighet" : 
                          x.qualifier === 1 ? "lindrig svårighet" :
                          x.qualifier === 2 ? "måttlig svårighet" :
                          x.qualifier === 3 ? "svår svårighet" : "total svårighet";
          lines.push(`  • ${x.code} - ${x.label} (${severity})`);
        });
      } else {
        lines.push(`  Inga identifierade svårigheter`);
      }
      lines.push("");
    
      lines.push(`🏃 AKTIVITETER OCH DELAKTIGHET (d):`);
      if (d.icf.activitiesParticipation.length > 0) {
        d.icf.activitiesParticipation.forEach(x => {
          const severity = x.qualifier === 0 ? "ingen svårighet" : 
                          x.qualifier === 1 ? "lindrig svårighet" :
                          x.qualifier === 2 ? "måttlig svårighet" :
                          x.qualifier === 3 ? "svår svårighet" : "total svårighet";
          lines.push(`  • ${x.code} - ${x.label} (${severity})`);
        });
      } else {
        lines.push(`  Inga identifierade begränsningar`);
      }
      lines.push("");
    
      lines.push(`🌍 OMGIVNINGSFAKTORER (e):`);
      if (d.icf.environmentalFactors.length > 0) {
        d.icf.environmentalFactors.forEach(x => {
          const impactText = x.impact < 0 ? `barriär (${x.impact})` : 
                            x.impact > 0 ? `underlättare (+${x.impact})` : 
                            `neutral (0)`;
          lines.push(`  • ${x.code} - ${x.label} (${impactText})`);
        });
      } else {
        lines.push(`  Inga identifierade omgivningsfaktorer`);
      }
      lines.push("");
    
      lines.push(`💡 FÖRESLAGNA ARBETSTERAPEUTISKA INSATSER:`);
      if (d.suggestedInterventions.length > 0) {
        d.suggestedInterventions.forEach((s, i) => lines.push(`  ${i + 1}. ${s}`));
      } else {
        lines.push(`  Inga förslag genererade`);
      }
      lines.push("");
    
      if (d.missingInfoQuestions?.length) {
        lines.push(`❓ KOMPLETTERANDE FRÅGOR (vid behov):`);
        d.missingInfoQuestions.forEach((q, i) => lines.push(`  ${i + 1}. ${q}`));
        lines.push("");
      }
      
      lines.push(`═══════════════════════════════════════`);
    
      return lines.join("\n");
    }

    const emailParams = {
      to_email: THERAPIST_EMAIL,
      subject,
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

    console.log("📧 Sending email with params:", {
      to: emailParams.to_email,
      subject: emailParams.subject,
      patientName: emailParams.patient_name,
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID
    });

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      emailParams
    );

    console.log("📬 EmailJS response:", response);

    if (response.status === 200 || response.text === "OK") {
      console.log("✅ Referral sent successfully:", referral.id);
      return { success: true };
    }

    console.error("❌ EmailJS response not OK:", response);
    return {
      success: false,
      error: `Det gick inte att skicka remissen. Status: ${response.status}. Kontakta otairemiss@gmail.com.`,
    };
  } catch (error) {
    console.error("❌ Error sending referral:", error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return {
      success: false,
      error: error instanceof Error 
        ? `Ett fel uppstod vid sändning: ${error.message}. Kontakta otairemiss@gmail.com.` 
        : "Ett oväntat fel uppstod. Kontrollera din internetanslutning och försök igen.",
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
