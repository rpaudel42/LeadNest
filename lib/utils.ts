import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// `cn` merges Tailwind classes with conditional logic
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
