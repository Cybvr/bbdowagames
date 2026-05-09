export type UserRole = "player" | "admin";

export type AppUser = {
  name: string;
  email: string;
  role: UserRole;
};

export const allowedEmailDomain = "bbdowestafrica.com";
export const allowedEmailDomains = ["bbdowestafrica.com", "ddblagos.com", "casersgroup.com", "gmail.com"]; // gmail.com added for testing - remove before launch
export const allowedEmailDomainsLabel = allowedEmailDomains.map((domain) => `@${domain}`).join(", ");

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isAllowedEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return allowedEmailDomains.some((domain) => normalizedEmail.endsWith(`@${domain}`));
}

export function getDisplayNameForEmail(email: string) {
  const [localPart] = normalizeEmail(email).split("@");
  return localPart
    .split(".")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
