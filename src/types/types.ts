export type user = {
  id: string;
  email: string;
  name: string;
  userType: "patient" | "provider";
};

export type message = {
  id: string;
  role: user | "assistant";
  content: string;
  timestamp: string;
  senderId?: string;
  recipientId?: string;
  attachments?: string[];
};

export type chatSession = {
  id: string;
  userId: string;
  providerId?: string;
  createdAt: string;
  updatedAt: string;
  title?: string;
  messages: message[];
  metadata?: Record<string, unknown>;
};

export type provider = {
  id: string;
  name: string;
  specialty?: string;
  contactInfo?: string;
};

// Referral/Remiss types
export type ReferralUrgency = "low" | "medium" | "high";

export type ReferralForm = {
  id: string;
  userId: string;
  createdAt: string;
  status: "draft" | "submitted" | "sent" | "failed";

  // Patient information
  patientInfo: {
    name: string;
    email: string;
    phone: string;
    age?: number;
    address?: string;
  };

  // Main challenges/concerns
  challenges: {
    primary: string;
    secondary?: string[];
    duration?: string; // Hur länge har problemet funnits
    impact: string; // Hur påverkar det vardagen
  };

  // AI conversation context
  conversationSummary: {
    messageCount: number;
    mainTopics: string[];
    aiSuggestionsTried: string[];
    conversationText?: string; // Full conversation if needed
  };

  // Specific needs
  needs: {
    physicalAids: boolean; // Behöver fysiska hjälpmedel
    physicalAidsList?: string[];
    homeVisit: boolean; // Behöver hembesök
    workplaceVisit: boolean; // Behöver arbetsplatsbesök
    followUp: boolean; // Behöver uppföljning
    other?: string;
  };

  // Urgency level
  urgency: ReferralUrgency;
  urgencyReason?: string;

  // Additional notes
  additionalNotes?: string;

  // Consent
  consentGiven: boolean;
  consentTimestamp?: string;
};
