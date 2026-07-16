import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind className 병합 (shadcn cn) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
