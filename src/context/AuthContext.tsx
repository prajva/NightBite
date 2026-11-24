'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role, UserProfile } from '@/types';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebaseConfig';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FbUser,
} from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  role: Role;
  allowedDomain: string;
  adminEmails: string[];
  rejectionError: string | null;
  isLoading: boolean;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  clearRejectionError: () => void;
  signInWithEmail: (email: string, name?: string) => boolean;
  signInWithGoogle: () => Promise<void>;
  adminLoginWithCredentials: (
    email: string,
    password?: string,
    passcode?: string
  ) => Promise<{ success: boolean; error?: string }>;
  switchDemoUser: (target: 'student' | 'roommate' | 'admin' | 'gmail') => void;
  logout: () => void;
}

const DEFAULT_ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_ALLOWED_DOMAIN || 'vitapstudent.ac.in';
const DEFAULT_ADMIN_EMAILS = (
  process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
  'admin@nightbite.ac.in,messadmin@vitap.ac.in,prajval@nightbite.ac.in'
)
  .toLowerCase()
  .split(',')
  .map((e) => e.trim());

export const STRONG_DEFAULT_ADMIN = {
  email: 'admin@nightbite.ac.in',
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'NightBite@Admin#2026!',
  counterPasscode: process.env.NEXT_PUBLIC_ADMIN_PASSCODE || '8392',
};

const DEMO_USERS: Record<'student' | 'roommate' | 'admin' | 'gmail', UserProfile> = {
  student: {
    id: 'std_kavya_304',
    email: 'kavya.21bce@vitapstudent.ac.in',
    name: 'Kavya S.',
    role: 'STUDENT',
    isDemo: true,
  },
  roommate: {
    id: 'std_rahul_304',
    email: 'rahul.21bce@vitapstudent.ac.in',
    name: 'Rahul V.',
    role: 'STUDENT',
    isDemo: true,
  },
  admin: {
    id: 'adm_mess_master',
    email: 'admin@nightbite.ac.in',
    name: 'Mess Counter Admin',
    role: 'ADMIN',
    isDemo: true,
  },
  gmail: {
    id: 'usr_gmail_test',
    email: 'john.doe@gmail.com',
    name: 'John Doe',
    role: 'STUDENT',
    isDemo: true,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const allowedDomain = DEFAULT_ALLOWED_DOMAIN.toLowerCase();
  const adminEmails = DEFAULT_ADMIN_EMAILS;

  // Initialize with student demo user
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nightbite_active_user');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEMO_USERS.student;
  });

  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('nightbite_active_user', JSON.stringify(user));
      } catch {}
    } else {
      try {
        localStorage.removeItem('nightbite_active_user');
      } catch {}
    }
  }, [user]);

  // Listen to real Firebase Auth state if enabled
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FbUser | null) => {
        if (fbUser && fbUser.email) {
          const emailLower = fbUser.email.toLowerCase();
          const isAdmin = adminEmails.includes(emailLower);
          const isStudentDomain = emailLower.endsWith(`@${allowedDomain}`);

          if (!isAdmin && !isStudentDomain) {
            setRejectionError(
              `Access Restricted: Only official university student accounts (@${allowedDomain}) or authorized mess admins are permitted. Your account (${emailLower}) was rejected.`
            );
            if (auth) {
              fbSignOut(auth).catch(() => {});
            }
            return;
          }

          const profile: UserProfile = {
            id: fbUser.uid,
            email: fbUser.email,
            name: fbUser.displayName || (isAdmin ? 'Mess Counter Admin' : fbUser.email.split('@')[0]),
            role: isAdmin ? 'ADMIN' : 'STUDENT',
            isDemo: false,
          };
          setUser(profile);
          setRejectionError(null);
        }
      });
      return () => unsubscribe();
    }
  }, [allowedDomain, adminEmails]);

  const clearRejectionError = () => setRejectionError(null);

  // Email validation & student sign in
  const signInWithEmail = (email: string, name?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = adminEmails.includes(cleanEmail);
    const isStudentDomain = cleanEmail.endsWith(`@${allowedDomain}`);

    if (!isAdmin && !isStudentDomain) {
      setRejectionError(
        `Access Restricted: Only university student accounts (@${allowedDomain}) are permitted. Personal Gmail or external accounts (@${cleanEmail.split('@')[1] || 'domain'}) are strictly rejected.`
      );
      return false;
    }

    setRejectionError(null);
    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      name: name?.trim() || cleanEmail.split('@')[0].toUpperCase(),
      role: isAdmin ? 'ADMIN' : 'STUDENT',
      isDemo: true,
    };
    setUser(profile);
    return true;
  };

  /**
   * Secure Admin Login via Strong Password or Counter Passcode
   */
  const adminLoginWithCredentials = async (
    email: string,
    password?: string,
    passcode?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const isWhitelisted = adminEmails.includes(cleanEmail);

    if (!isWhitelisted) {
      return {
        success: false,
        error: `Unauthorized Admin Email! Only whitelisted counter admins (${adminEmails.join(', ')}) can log in.`,
      };
    }

    // Try Firebase Email/Password if configured
    if (isFirebaseConfigured && auth && password) {
      try {
        setIsLoading(true);
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const profile: UserProfile = {
          id: cred.user.uid,
          email: cleanEmail,
          name: 'Mess Counter Admin',
          role: 'ADMIN',
          isDemo: false,
        };
        setUser(profile);
        setIsAdminLoginModalOpen(false);
        return { success: true };
      } catch (err: unknown) {
        console.warn('Firebase admin sign-in fallback to local verification:', err);
      } finally {
        setIsLoading(false);
      }
    }

    // Local / Passcode Verification
    const isPasswordValid = password && password === STRONG_DEFAULT_ADMIN.password;
    const isPasscodeValid = passcode && passcode === STRONG_DEFAULT_ADMIN.counterPasscode;

    if (isPasswordValid || isPasscodeValid) {
      const profile: UserProfile = {
        id: 'adm_counter_master',
        email: cleanEmail,
        name: 'Mess Counter Admin',
        role: 'ADMIN',
        isDemo: true,
      };
      setUser(profile);
      setIsAdminLoginModalOpen(false);
      setRejectionError(null);
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid Admin Password or Counter Passcode! Check credentials.',
    };
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      signInWithEmail(DEMO_USERS.student.email, DEMO_USERS.student.name);
      return;
    }

    setIsLoading(true);
    setRejectionError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase() || '';
      const isAdmin = adminEmails.includes(email);
      const isStudentDomain = email.endsWith(`@${allowedDomain}`);

      if (!isAdmin && !isStudentDomain) {
        setRejectionError(
          `Access Restricted: Google account ${email} is not from @${allowedDomain}. Only university emails are permitted.`
        );
        if (auth) {
          await fbSignOut(auth);
        }
      }
    } catch (err: unknown) {
      console.error('Google Sign In Error:', err);
      setRejectionError((err as Error).message || 'Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoUser = (target: 'student' | 'roommate' | 'admin' | 'gmail') => {
    const selected = DEMO_USERS[target];
    if (target === 'gmail') {
      setRejectionError(
        `Access Restricted: Personal Gmail account (${selected.email}) was rejected. Only university accounts (@${allowedDomain}) can access NightBite.`
      );
      return;
    }

    setRejectionError(null);
    setUser(selected);
  };

  const logout = () => {
    if (isFirebaseConfigured && auth) {
      fbSignOut(auth).catch(() => {});
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'STUDENT',
        allowedDomain,
        adminEmails,
        rejectionError,
        isLoading,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        clearRejectionError,
        signInWithEmail,
        signInWithGoogle,
        adminLoginWithCredentials,
        switchDemoUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
