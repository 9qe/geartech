import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const t = <T extends { ar: string; en: string }>(
  obj: T,
  lang: "ar" | "en"
): string => obj[lang];
