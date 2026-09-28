import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names, with later Tailwind utilities winning over earlier ones.
 *
 * The convention shadcn-shaped components are written against. `clsx` and
 * `tailwind-merge` were already dependencies; this is the two-line helper that
 * was missing.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
