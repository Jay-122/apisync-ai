import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function confidenceLabel(confidence: number) {
  if (confidence >= 0.95) return "High confidence";
  if (confidence >= 0.8) return "Review required";
  return "Below automatic threshold";
}
