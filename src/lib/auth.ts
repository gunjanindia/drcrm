import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { User, UserRole } from '@/types';
import { globalStore } from './store';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'digital_ranchi_os_super_secret_jwt_signing_key_32_chars'
);

export const AUTH_COOKIE_NAME = 'dr_auth_token';

export interface AuthSessionPayload {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  clientId?: string;
}

// In-memory / persistent store for active password reset verification requests (15 mins TTL)
const passwordResetStore: Map<string, { code: string; expiresAt: number }> = new Map();

// 1. Password Hashing (Bcrypt cost factor 12)
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 2. JWT Session Generation (Jose)
export async function signAuthToken(payload: AuthSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyAuthToken(token: string): Promise<AuthSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthSessionPayload;
  } catch {
    return null;
  }
}

// 3. User Authentication Service
export async function authenticateWithCredentials(
  email: string,
  passwordAttempt: string
): Promise<{ user: User; token: string } | null> {
  const user = globalStore.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return null;

  let isValid = false;
  if (user.passwordHash) {
    isValid = await verifyPassword(passwordAttempt, user.passwordHash);
  } else {
    // Default fallback password for initial/seeded demo accounts
    isValid =
      passwordAttempt === 'Password@123' ||
      passwordAttempt === 'admin123' ||
      passwordAttempt === 'demo123';
  }

  if (!isValid) return null;

  const sessionPayload: AuthSessionPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    clientId: user.clientId,
  };

  const token = await signAuthToken(sessionPayload);
  return { user, token };
}

// 4. Password Reset OTP / Code Generator
export async function requestPasswordReset(email: string): Promise<{
  success: boolean;
  message: string;
  code?: string;
}> {
  const cleanEmail = email.trim().toLowerCase();
  const user = globalStore.users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return {
      success: false,
      message: 'No account registered with this email address.',
    };
  }

  // Generate secure 6-digit numeric verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

  passwordResetStore.set(cleanEmail, { code, expiresAt });

  return {
    success: true,
    message: `Verification code generated for ${cleanEmail}. Enter the 6-digit code to set your new password.`,
    code, // Returned for instant testing and verification display
  };
}

// 5. Password Reset Execution
export async function resetPasswordWithCode(
  email: string,
  code: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const resetRecord = passwordResetStore.get(cleanEmail);

  if (!resetRecord) {
    return {
      success: false,
      message: 'No active password reset request found. Please request a new verification code.',
    };
  }

  if (Date.now() > resetRecord.expiresAt) {
    passwordResetStore.delete(cleanEmail);
    return {
      success: false,
      message: 'Verification code has expired. Please request a new one.',
    };
  }

  if (resetRecord.code !== code.trim()) {
    return {
      success: false,
      message: 'Invalid 6-digit verification code. Please check and try again.',
    };
  }

  if (newPassword.length < 6) {
    return {
      success: false,
      message: 'Password must be at least 6 characters long.',
    };
  }

  const user = globalStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return { success: false, message: 'User account not found.' };
  }

  // Hash new password using bcrypt cost factor 12
  const newHash = await hashPassword(newPassword);
  user.passwordHash = newHash;

  // Persist updated credentials
  globalStore.saveToFile();
  passwordResetStore.delete(cleanEmail);

  return {
    success: true,
    message: 'Your password has been reset successfully. You can now sign in with your new password.',
  };
}

// 6. Authenticated In-App Password Change
export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const user = globalStore.users.find((u) => u.id === userId);
  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  let isCurrentValid = false;
  if (user.passwordHash) {
    isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
  } else {
    isCurrentValid =
      currentPassword === 'Password@123' ||
      currentPassword === 'admin123' ||
      currentPassword === 'demo123';
  }

  if (!isCurrentValid) {
    return { success: false, message: 'Current password is incorrect.' };
  }

  if (newPassword.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters long.' };
  }

  user.passwordHash = await hashPassword(newPassword);
  globalStore.saveToFile();

  return { success: true, message: 'Password updated successfully!' };
}

// 7. Server-side session getter
export async function getCurrentUserSession(): Promise<AuthSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAuthToken(token);
  } catch {
    return null;
  }
}
