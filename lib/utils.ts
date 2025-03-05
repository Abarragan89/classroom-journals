import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate class code
export function generateClassCode() {
  const characters = [
    ..."ABCDEFGHJKMNPQRSTUVWXYZ", // Uppercase (without O, L, I, Q)
    ..."abcdefghkmnpqrstuvwxyz", // Lowercase (without o, l, i, q)
    ..."23456789" // Numbers 1-9
  ];

  const classCode = [];
  for(let i = 0; i < 6; i++) {
    classCode.push(characters[Math.floor(Math.random() * characters.length)])
  }
  return classCode.join("")
}

export function formatDateShort(date: Date): string {
  const month = date.getMonth() + 1; // Months are zero-indexed, so we add 1
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of the year

  return `${month}/${day}/${year}`;
}
