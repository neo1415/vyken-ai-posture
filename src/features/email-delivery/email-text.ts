export const USER_REPORT_DISCLAIMER =
  "This report is a framework-informed starting point. It is not a legal opinion, audit, certification, or live technical scan.";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatGreeting(name: string | null): string {
  if (name?.trim()) {
    return `Hi ${name.trim()},`;
  }
  return "Hi,";
}

export function formatLabelValue(label: string, value: string | null): string {
  return `- ${label}: ${value?.trim() ? value.trim() : "Not provided"}`;
}
