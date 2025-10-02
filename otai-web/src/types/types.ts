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
