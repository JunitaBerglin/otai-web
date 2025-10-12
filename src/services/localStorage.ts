import type { user, message } from "../types/types";

// Keys for localStorage
const KEYS = {
  CURRENT_USER: "otai_current_user",
  USERS: "otai_users",
  MESSAGES: "otai_messages",
  SESSIONS: "otai_sessions",
  ACTIVE_SESSION: "otai_active_session",
};

// User Management
export const saveCurrentUser = (user: user): void => {
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
};

export const getCurrentUser = (): user | null => {
  const userStr = localStorage.getItem(KEYS.CURRENT_USER);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem(KEYS.CURRENT_USER);
};

// All Users Management (for auth)
export const getAllUsers = (): user[] => {
  const usersStr = localStorage.getItem(KEYS.USERS);
  if (!usersStr) return [];
  try {
    return JSON.parse(usersStr);
  } catch {
    return [];
  }
};

export const saveUser = (user: user): void => {
  const users = getAllUsers();
  const existingIndex = users.findIndex((u) => u.id === user.id);

  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }

  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

export const findUserByEmail = (email: string): user | null => {
  const users = getAllUsers();
  return users.find((u) => u.email === email) || null;
};

// Messages Management
export const getMessages = (userId: string): message[] => {
  const messagesStr = localStorage.getItem(KEYS.MESSAGES);
  if (!messagesStr) return [];
  try {
    const allMessages: Record<string, message[]> = JSON.parse(messagesStr);
    return allMessages[userId] || [];
  } catch {
    return [];
  }
};

export const saveMessage = (userId: string, message: message): void => {
  const messagesStr = localStorage.getItem(KEYS.MESSAGES);
  let allMessages: Record<string, message[]> = {};

  if (messagesStr) {
    try {
      allMessages = JSON.parse(messagesStr);
    } catch {
      allMessages = {};
    }
  }

  if (!allMessages[userId]) {
    allMessages[userId] = [];
  }

  allMessages[userId].push(message);
  localStorage.setItem(KEYS.MESSAGES, JSON.stringify(allMessages));
};

export const clearMessages = (userId: string): void => {
  const messagesStr = localStorage.getItem(KEYS.MESSAGES);
  if (!messagesStr) return;

  try {
    const allMessages: Record<string, message[]> = JSON.parse(messagesStr);
    delete allMessages[userId];
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(allMessages));
  } catch {
    // Ignore errors
  }
};

// Chat Sessions Management
interface ChatSession {
  id: string;
  userId: string;
  messages: message[];
  createdAt: string;
  lastActivityAt: string;
  title: string;
}

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

export const getActiveSession = (userId: string): ChatSession | null => {
  const sessionStr = localStorage.getItem(`${KEYS.ACTIVE_SESSION}_${userId}`);
  if (!sessionStr) return null;
  try {
    const session: ChatSession = JSON.parse(sessionStr);

    // Check if session is older than 3 hours
    const lastActivity = new Date(session.lastActivityAt).getTime();
    const now = Date.now();

    if (now - lastActivity > THREE_HOURS_MS) {
      // Archive the session
      archiveSession(userId, session);
      clearActiveSession(userId);
      return null;
    }

    return session;
  } catch {
    return null;
  }
};

export const saveActiveSession = (
  userId: string,
  messages: message[]
): void => {
  const existingSession = getActiveSession(userId);

  const session: ChatSession = {
    id: existingSession?.id || crypto.randomUUID(),
    userId,
    messages,
    createdAt: existingSession?.createdAt || new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    title: existingSession?.title || generateSessionTitle(messages),
  };

  localStorage.setItem(
    `${KEYS.ACTIVE_SESSION}_${userId}`,
    JSON.stringify(session)
  );
};

export const clearActiveSession = (userId: string): void => {
  localStorage.removeItem(`${KEYS.ACTIVE_SESSION}_${userId}`);
};

export const archiveSession = (userId: string, session: ChatSession): void => {
  const sessionsStr = localStorage.getItem(KEYS.SESSIONS);
  let allSessions: Record<string, ChatSession[]> = {};

  if (sessionsStr) {
    try {
      allSessions = JSON.parse(sessionsStr);
    } catch {
      allSessions = {};
    }
  }

  if (!allSessions[userId]) {
    allSessions[userId] = [];
  }

  allSessions[userId].unshift(session); // Add to beginning of array
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(allSessions));
};

export const getArchivedSessions = (userId: string): ChatSession[] => {
  const sessionsStr = localStorage.getItem(KEYS.SESSIONS);
  if (!sessionsStr) return [];

  try {
    const allSessions: Record<string, ChatSession[]> = JSON.parse(sessionsStr);
    return allSessions[userId] || [];
  } catch {
    return [];
  }
};

export const loadArchivedSession = (
  sessionId: string,
  userId: string
): ChatSession | null => {
  const sessions = getArchivedSessions(userId);
  return sessions.find((s) => s.id === sessionId) || null;
};

export const deleteArchivedSession = (
  sessionId: string,
  userId: string
): void => {
  const sessionsStr = localStorage.getItem(KEYS.SESSIONS);
  if (!sessionsStr) return;

  try {
    const allSessions: Record<string, ChatSession[]> = JSON.parse(sessionsStr);
    if (allSessions[userId]) {
      allSessions[userId] = allSessions[userId].filter(
        (s) => s.id !== sessionId
      );
      localStorage.setItem(KEYS.SESSIONS, JSON.stringify(allSessions));
    }
  } catch {
    // Ignore errors
  }
};

const generateSessionTitle = (messages: message[]): string => {
  // Get first user message
  const firstUserMessage = messages.find((m) => m.role !== "assistant");
  if (firstUserMessage) {
    const content = firstUserMessage.content.trim();
    // Take first 50 characters
    return content.length > 50 ? content.substring(0, 50) + "..." : content;
  }
  return "Ny konversation";
};

// Clear all data (for debugging/reset)
export const clearAllData = (): void => {
  localStorage.removeItem(KEYS.CURRENT_USER);
  localStorage.removeItem(KEYS.USERS);
  localStorage.removeItem(KEYS.MESSAGES);
};
