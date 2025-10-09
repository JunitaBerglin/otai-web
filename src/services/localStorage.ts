import type { user, message } from "../types/types";

// Keys for localStorage
const KEYS = {
  CURRENT_USER: "otai_current_user",
  USERS: "otai_users",
  MESSAGES: "otai_messages",
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

// Clear all data (for debugging/reset)
export const clearAllData = (): void => {
  localStorage.removeItem(KEYS.CURRENT_USER);
  localStorage.removeItem(KEYS.USERS);
  localStorage.removeItem(KEYS.MESSAGES);
};
