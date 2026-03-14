import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBDT(paisa: number): string {
  const taka = paisa / 100;
  return `৳${taka.toLocaleString("bn-BD", { minimumFractionDigits: 0 })}`;
}

export function formatBDTCompact(paisa: number): string {
  const taka = paisa / 100;
  if (taka >= 100000) return `৳${(taka / 100000).toFixed(1)} লাখ`;
  if (taka >= 1000) return `৳${(taka / 1000).toFixed(1)}K`;
  return formatBDT(paisa);
}

export function discountPercent(original: number, sale: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - sale) / original) * 100);
}

export function truncate(text: string, len: number): string {
  return text.length > len ? text.slice(0, len) + "…" : text;
}

export function maskPhone(phone: string): string {
  return `${phone.slice(0, 6)}*****${phone.slice(-3)}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
