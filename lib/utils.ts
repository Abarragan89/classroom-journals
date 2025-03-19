import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge";
import crypto from 'crypto';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate class code
const characters = [..."abcdefghikmnpqrstuvwxyz"]; // Lowercase (without o, l)

export function generateClassCode(excludeArr: string[]): string {
  const classCode = Array.from({ length: 6 }, () =>
    characters[Math.floor(Math.random() * characters.length)]
  ).join("");

  return excludeArr.includes(classCode)
    ? generateClassCode(excludeArr)
    : classCode;
}

export function formatDateShort(date: Date): string {
  const month = date.getMonth() + 1; // Months are zero-indexed, so we add 1
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of the year

  return `${month}/${day}/${year}`;
}

export function formatDateLong(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}


// Encryption and Decryption Settings
const algorithm = 'aes-256-cbc'; // AES algorithm
const secretKey = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY || 'fallback-key').digest('base64').slice(0, 32);

// Encryption Helpers
export function encryptText(text: string, iv: Buffer<ArrayBufferLike>) {
  // const iv = crypto.randomBytes(ivLength); // Generate a random IV
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv); // Create cipher
  let encrypted = cipher.update(text, 'utf8', 'hex'); // Encrypt the text
  encrypted += cipher.final('hex');
  // return { iv: iv.toString('hex'), encryptedData: encrypted }; // Return both IV and encrypted text
  return { encryptedData: encrypted }; // Return both IV and encrypted text
}

// Decrypt function
export function decryptText(encryptedData: string, iv: string) {
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted; // Return decrypted text
}

// genrerate random password for new student
export function generateRandom5DigitNumber(excludeArr: string[]) {
  const min = 10000;
  const max = 99999;
  const randomNumber = (Math.floor(Math.random() * (max - min + 1)) + min).toString();

  if (excludeArr.includes(randomNumber)) {
    return generateRandom5DigitNumber(excludeArr)
  } else {
    return randomNumber
  }
}