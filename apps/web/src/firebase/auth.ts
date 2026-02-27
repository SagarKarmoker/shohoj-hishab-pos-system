import {
  signInWithPhoneNumber,
  ConfirmationResult,
  RecaptchaVerifier,
  signOut as firebaseSignOut,
  User,
  getIdToken,
} from 'firebase/auth';
import { auth } from './config';

let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Initialize reCAPTCHA verifier for phone authentication
 */
export function initializeRecaptcha(containerId: string): RecaptchaVerifier {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }
  
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      // reCAPTCHA expired
    },
  });
  
  return recaptchaVerifier;
}

/**
 * Send OTP to the provided phone number
 */
export async function sendOTP(phoneNumber: string): Promise<ConfirmationResult> {
  const verifier = initializeRecaptcha('recaptcha-container');
  
  // Format phone number if needed (add + for international format)
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
  
  const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
  return confirmationResult;
}

/**
 * Verify the OTP entered by the user
 */
export async function verifyOTP(
  confirmationResult: ConfirmationResult,
  otp: string
): Promise<User> {
  const result = await confirmationResult.confirm(otp);
  return result.user;
}

/**
 * Get Firebase ID token for the current user
 */
export async function getFirebaseToken(user: User): Promise<string> {
  return await getIdToken(user, true);
}

/**
 * Sign out from Firebase
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
}

/**
 * Get current user from auth state
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Format phone number for Bangladesh (add +88 if not present)
 */
export function formatBangladeshPhone(phone: string): string {
  // Remove any non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If starts with 0, remove it
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // If doesn't start with +, add +88 (Bangladesh country code)
  if (!cleaned.startsWith('+')) {
    cleaned = '+88' + cleaned;
  }
  
  return cleaned;
}
