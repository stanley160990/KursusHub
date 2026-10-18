import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plain-text password using BCrypt algorithm
 */
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainText, salt);
}

/**
 * Compare plain-text password against BCrypt hash
 */
export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainText, hash);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically sound random password for student import
 * Defaults to 8 characters with upper, lower, and numbers for high readability
 */
export function generateSecurePassword(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!#';
  let result = '';
  const array = new Uint8Array(length);
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return result;
}

/**
 * Generate a unique 8-digit NPM with prefix 'G01' followed by 5 random digits
 * Example: G0149201 (Total length: 8 chars)
 * Ensures that the generated NPM does not already exist in the course student list.
 */
export function generateUniqueNPM(existingNpms: string[] = []): string {
  const existingSet = new Set(existingNpms.map((n) => n.trim().toUpperCase()));
  let candidate = '';
  let attempts = 0;

  do {
    // 5 random digits (10000 - 99999)
    const randomFiveDigits = Math.floor(10000 + Math.random() * 90000).toString();
    candidate = `G01${randomFiveDigits}`;
    attempts++;
  } while (existingSet.has(candidate.toUpperCase()) && attempts < 1000);

  return candidate;
}

/**
 * Generate 16-digit alphanumeric password (A-Z, a-z, 0-9)
 * Used specifically for Instructors and Assistants password generation
 */
export function generateAlphanumeric16(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(16);

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
    for (let i = 0; i < 16; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return result;
}

