export type UserRole = "player" | "admin";

export type AppUser = {
  name: string;
  email: string;
  role: UserRole;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isAllowedEmail(_email: string) {
  return true;
}

export function getDisplayNameForEmail(email: string) {
  const [localPart] = normalizeEmail(email).split("@");
  return localPart
    .split(".")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
