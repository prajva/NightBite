'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role, UserProfile } from '@/types';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebaseConfig';
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged, User as FbUser } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  role: Role;
  allowedDomain: string;
  adminEmails: string[];
  rejectionError: string | null;
  isLoading: boolean;
  clearRejectionError: () => void;
  signInWithEmail: (email: string, name?: string) => boolean;
  signInWithGoogle: () => Promise<void>;
  switchDemoUser: (target: 'student' | 'roommate' | 'admin' | 'gmail') => void;
  logout: () => void;
}

const DEFAULT_ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_ALLOWED_DOMAIN || 'vitapstudent.ac.in';
const DEFAULT_ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'messadmin@vitap.ac.in,admin@nightbite.ac.in')
  .toLowerCase()
  .split(',')
  .map((e) => e.trim());

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
    email: 'messadmin@vitap.ac.in',
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
            fbSignOut(auth).catch(() => {});
            return;
          }

          const profile: UserProfile = {
            id: fbUser.uid,
            email: fbUser.email,
            name: fbUser.displayName || fbUser.email.split('@')[0],
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

  // Email validation & sign in
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

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      // If Firebase not configured, prompt with student domain
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
        await fbSignOut(auth);
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
      // Simulate rejection error for test
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
        clearRejectionError,
        signInWithEmail,
        signInWithGoogle,
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
