export type UserRole = "player" | "admin";

export type AppUser = {
  name: string;
  email: string;
  role: UserRole;
};

export const allowedEmailDomain = "bbdowestafrica.com";
export const allowedEmailDomains = ["bbdowestafrica.com", "ddblagos.com", "casersgroup.com"];
export const allowedEmailDomainsLabel = allowedEmailDomains.map((domain) => `@${domain}`).join(", ");

export const users: AppUser[] = [
  {
    name: "Jide Pinheiro",
    email: `jide.pinheiro@${allowedEmailDomain}`,
    role: "admin",
  },
  {
    name: "Duzie Ikwuegbu",
    email: "duzie.ikwuegbu@ddblagos.com",
    role: "player",
  },
  {
    name: "Stephen Ifebajo",
    email: `stephen.ifebajo@${allowedEmailDomain}`,
    role: "player",
  },
  {
    name: "Tolulope Badamassi",
    email: "tolulope.badamassi@casersgroup.com",
    role: "player",
  },
  {
    name: "Emeka Ajuzie",
    email: `emeka.ajuzie@${allowedEmailDomain}`,
    role: "player",
  },
];

export const adminEmails = users
  .filter((user) => user.role === "admin")
  .map((user) => user.email);

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

export function getUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return users.find((user) => user.email === normalizedEmail) ?? null;
}

export function getDisplayNameForEmail(email: string) {
  const user = getUserByEmail(email);

  if (user) {
    return user.name;
  }

  const [localPart] = normalizeEmail(email).split("@");
  return localPart
    .split(".")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
