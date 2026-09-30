// Email helpers for signup validation
// Separated so they can be used on both client and server

export function getEmailDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? ""
}

const FREE_EMAIL_PROVIDERS = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com",
  "icloud.com", "aol.com", "protonmail.com", "proton.me", "zoho.com",
  "mail.com", "yandex.com", "gmx.com", "msn.com", "me.com",
])

export function isWorkEmail(email: string): boolean {
  const domain = getEmailDomain(email)
  return !FREE_EMAIL_PROVIDERS.has(domain)
}
