import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const POSTER_API = process.env.NEXT_PUBLIC_POSTER_API
export const POSTER_URL = process.env.NEXT_PUBLIC_POSTER_URL
export const POSTER_TOKEN = process.env.NEXT_PUBLIC_POSTER_TOKEN
export const NEXT_BASE_URL = process.env.NEXT_BASE_URL
export const apiKeyYandex = process.env.NEXT_PUBLIC_YMAPS_API_KEY;
