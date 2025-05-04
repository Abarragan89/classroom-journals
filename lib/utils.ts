import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge";
import crypto from 'crypto';
import { ResponseData } from "@/types";

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

export function formatDateLong(date: Date, weekdayLength: 'long' | 'short' = 'long'): string {
  const options: Intl.DateTimeFormatOptions = { weekday: weekdayLength, month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

export function formatDateMonthDayYear(date: Date | undefined): string {
  if (!date) return ''; // Return an empty string if date is undefined

  const newDate = new Date(date)
  const year = newDate.getFullYear();
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const month = monthNames[newDate.getMonth()]; // Get month name from the array
  const day = newDate.getDate();

  return `${month} ${day}, ${year}`;
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

export function saveCoolDownToLocalStorage(cooldownTime: number) {
  const cooldownEnd = Date.now() + cooldownTime * 1000; // Convert seconds to milliseconds
  localStorage.setItem(`commentCoolDown`, cooldownEnd.toString());
}

export function checkCommentCoolDown(commentCoolDown: number) {
  // Determine remainingTime for Cooldown
  const currentTime = new Date();
  let lastComment = localStorage.getItem('lastCommentDate') as string | Date;
  // If no last comment time stamp, then let student comment
  if (!lastComment) return 0
  lastComment = new Date(lastComment)
  const cooldownEnd = new Date(lastComment.getTime() + (commentCoolDown * 1000));
  let remainingTime = Math.ceil((cooldownEnd.getTime() - currentTime.getTime()) / 1000); // Convert to seconds

  if (remainingTime <= 0) {
    return { remaining: ``, isDisabled: false }
  } else if (remainingTime > 60) {
    remainingTime = Math.floor(remainingTime / 60)
    return { remaining: `${remainingTime} minutes`, isDisabled: true }
  } else if (remainingTime < 60) {
    return { remaining: `${remainingTime} seconds`, isDisabled: true }
  }
}

export function responsePercentage(response: ResponseData[]) {
  // Dont get percentage if not all responses are not graded. 
  const isGraded = response?.every(entry => entry.score !== undefined)
  if (!isGraded) {
    return (
      'N/A'
    )
  } else {
    const totalQuestions = response.length
    const score = response.reduce((accum, currVal) => currVal.score + accum, 0)
    return `${(Math.round((score / totalQuestions) * 100)).toString()}%`
  }
}

export function responseScore(response: ResponseData[]) {
  const isGraded = response?.every(entry => entry.score !== undefined)
  if (!isGraded) {
    return (
      'Not Graded'
    )
  }
  const totalQuestions = response.length
  const score = response.reduce((accum, currVal) => currVal.score + accum, 0)
  return `${score} / ${totalQuestions}`
}