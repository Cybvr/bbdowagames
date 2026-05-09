export type UserRole = "player" | "admin";

export type AppUser = {
  name: string;
  email: string;
  role: UserRole;
};

export const allowedEmailDomain = "bbdowestafrica.com";
export const allowedEmailDomains = ["bbdowestafrica.com", "ddblagos.com", "casersgroup.com"];
export const allowedEmailDomainsLabel = allowedEmailDomains.map((domain) => `@${domain}`).join(", ");

// Bootstrap admin emails for initial setup
export const adminEmails = [
  `jide.pinheiro@${allowedEmailDomain}`,
];

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isAllowedEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return allowedEmailDomains.some((domain) => normalizedEmail.endsWith(`@${domain}`));
}

export function isAdminEmail(email: string) {
  return adminEmails.includes(normalizeEmail(email));
}

export function getDisplayNameForEmail(email: string) {
  const [localPart] = normalizeEmail(email).split("@");
  return localPart
    .split(".")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
