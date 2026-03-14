import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBDT(paisa: number): string {
  return `৳${(paisa / 100).toLocaleString("bn-BD")}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" });
}
