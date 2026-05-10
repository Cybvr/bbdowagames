import { getDisplayNameForEmail, normalizeEmail } from "./users";

export type SessionUser = {
  name: string;
  email: string;
  isAdmin: boolean;
};

const sessionKey = "wieldquest-user";

export function createSessionUser(email: string): SessionUser {
  const normalizedEmail = normalizeEmail(email);

  return {
    name: getDisplayNameForEmail(normalizedEmail),
    email: normalizedEmail,
    isAdmin: false, // Everyone is a player by default unless Firestore says otherwise
  };
}

export function getStoredUser(): SessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = window.localStorage.getItem(sessionKey);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as SessionUser;
  } catch {
    window.localStorage.removeItem(sessionKey);
    return null;
  }
}

export function saveStoredUser(user: SessionUser) {
  window.localStorage.setItem(sessionKey, JSON.stringify(user));
}

export function clearStoredUser() {
  window.localStorage.removeItem(sessionKey);
}
