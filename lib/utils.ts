import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  const num = Number(amount ?? 0);
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
  }).format(isNaN(num) ? 0 : num);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-TZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-TZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-TZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(name: string): string {
  if (!name || !name.trim()) return "??";
  return name
    .trim()
    .split(" ")
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + "..." : str;
}

export function formatPhoneNumber(phone: string): string {
  // Format Tanzanian phone numbers
  const cleaned = phone.replace(/\D/g, "");
  let normalized = cleaned;
  if (cleaned.startsWith("0") && cleaned.length >= 10) {
    normalized = "255" + cleaned.slice(1);
  }
  if (normalized.startsWith("255") && normalized.length >= 12) {
    return `+${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6, 9)} ${normalized.slice(9)}`;
  }
  return phone;
}

export function calculateAge(dateOfBirth: string | Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    APPLIED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    PENDING_REVIEW: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    ACTIVE: "bg-success/10 text-success border-success/20",
    INACTIVE: "bg-muted text-muted-foreground border-border",
    SUSPENDED: "bg-destructive/10 text-destructive border-destructive/20",
    DORMANT: "bg-accent/10 text-accent border-accent/20",
    PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    COMPLETED: "bg-success/10 text-success border-success/20",
    APPROVED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    DISBURSED: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    CLOSED: "bg-muted text-muted-foreground border-border",
    WRITTEN_OFF: "bg-destructive/10 text-destructive border-destructive/20",
    DEFAULTED: "bg-red-600/10 text-red-700 border-red-600/20",
    REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
    OVERDUE: "bg-red-500/10 text-red-600 border-red-500/20",
    PAID: "bg-success/10 text-success border-success/20",
    PARTIAL: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    REVERSED: "bg-muted text-muted-foreground border-border",
    FAILED: "bg-destructive/10 text-destructive border-destructive/20",
    INITIATED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    SENT: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    CALLBACK_RECEIVED: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    EXPIRED: "bg-muted text-muted-foreground border-border",
    CANCELLED: "bg-muted text-muted-foreground border-border",
    PROCESSING: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };
  return statusColors[status.toUpperCase()] || "bg-muted text-muted-foreground border-border";
}

export function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
