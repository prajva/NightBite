'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role, UserProfile } from '@/types';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebaseConfig';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FbUser,
} from 'firebase/auth';

interface SignUpPayload {
  firstName: string;
  middleName?: string;
  surname: string;
  email: string;
  roomNumber: string; // strictly for MH-4 block
  password?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: Role;
  allowedDomain: string;
  adminEmails: string[];
  rejectionError: string | null;
  isLoading: boolean;
  clearRejectionError: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (payload: SignUpPayload) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<void>;
  quickDemoLogin: (role: 'student' | 'admin') => void;
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

const DEMO_PRESETS: Record<'student' | 'admin', UserProfile> = {
  student: {
    id: 'std_kavya_mh4_304',
    email: 'kavya.21bce@vitapstudent.ac.in',
    name: 'Kavya S.',
    firstName: 'Kavya',
    surname: 'S.',
    roomNumber: 'Room 304',
    role: 'STUDENT',
    isDemo: true,
  },
  admin: {
    id: 'adm_mh4_counter',
    email: 'admin@nightbite.ac.in',
    name: 'MH-4 Mess Counter',
    firstName: 'MH-4',
    surname: 'Staff',
    roomNumber: 'MH-4 Ground Counter',
    role: 'ADMIN',
    isDemo: true,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const allowedDomain = DEFAULT_ALLOWED_DOMAIN.toLowerCase();
  const adminEmails = DEFAULT_ADMIN_EMAILS;

  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nightbite_active_user');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
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

  // Sync Firebase Auth if present
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FbUser | null) => {
        if (fbUser && fbUser.email) {
          const emailLower = fbUser.email.toLowerCase();
          const isAdmin = adminEmails.includes(emailLower);
          const isStudentDomain = emailLower.endsWith(`@${allowedDomain}`);

          if (!isAdmin && !isStudentDomain) {
            setRejectionError(
              `VIT-AP Student email required (@${allowedDomain}). External emails are restricted.`
            );
            if (auth) {
              fbSignOut(auth).catch(() => {});
            }
            return;
          }

          const profile: UserProfile = {
            id: fbUser.uid,
            email: fbUser.email,
            name: fbUser.displayName || (isAdmin ? 'MH-4 Counter Staff' : fbUser.email.split('@')[0]),
            roomNumber: 'MH-4 Room',
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

  const login = async (
    emailInput: string,
    passwordInput?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput?.trim() || '';

    // Check Admin
    const isAdminEmail = adminEmails.includes(cleanEmail) || cleanEmail === 'admin';
    const isPasswordMatch =
      cleanPassword === STRONG_DEFAULT_ADMIN.password ||
      cleanPassword === STRONG_DEFAULT_ADMIN.counterPasscode;

    if (isAdminEmail) {
      if (isPasswordMatch || cleanPassword === 'admin') {
        const adminProfile: UserProfile = {
          id: 'adm_mh4_master',
          email: STRONG_DEFAULT_ADMIN.email,
          name: 'MH-4 Mess Counter',
          firstName: 'MH-4',
          surname: 'Staff',
          roomNumber: 'MH-4 Ground Floor',
          role: 'ADMIN',
          isDemo: true,
        };
        setUser(adminProfile);
        setRejectionError(null);
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Incorrect staff credentials. Default: NightBite@Admin#2026! or PIN 8392',
        };
      }
    }

    // Try Firebase
    if (isFirebaseConfigured && auth && cleanPassword) {
      try {
        setIsLoading(true);
        const res = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        const isAdmin = adminEmails.includes(cleanEmail);
        const profile: UserProfile = {
          id: res.user.uid,
          email: cleanEmail,
          name: res.user.displayName || cleanEmail.split('@')[0],
          roomNumber: 'MH-4 Room',
          role: isAdmin ? 'ADMIN' : 'STUDENT',
          isDemo: false,
        };
        setUser(profile);
        setRejectionError(null);
        return { success: true };
      } catch (err: unknown) {
        console.warn('Firebase login fallback:', err);
      } finally {
        setIsLoading(false);
      }
    }

    // Student domain validation
    const isStudentDomain = cleanEmail.endsWith(`@${allowedDomain}`);
    if (!isStudentDomain) {
      const err = `Domain Restriction: Only official VIT-AP emails (@${allowedDomain}) can log in.`;
      setRejectionError(err);
      return { success: false, error: err };
    }

    const parts = cleanEmail.split('@')[0].split('.');
    const autoFirst = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Student';
    const autoLast = parts[1] ? parts[1].toUpperCase() : '';

    const studentProfile: UserProfile = {
      id: `std_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: cleanEmail,
      name: `${autoFirst} ${autoLast}`.trim(),
      firstName: autoFirst,
      surname: autoLast,
      roomNumber: 'MH-4 Room',
      role: 'STUDENT',
      isDemo: true,
    };

    setUser(studentProfile);
    setRejectionError(null);
    return { success: true };
  };

  const signUp = async (payload: SignUpPayload): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanFirst = payload.firstName.trim();
    const cleanMiddle = payload.middleName?.trim() || '';
    const cleanSurname = payload.surname.trim();
    const cleanRoom = payload.roomNumber.trim();

    if (!cleanFirst || !cleanSurname) {
      return { success: false, error: 'First Name and Surname are required.' };
    }
    if (!cleanRoom) {
      return { success: false, error: 'Room number is required (e.g., Room 304).' };
    }

    const isStudentDomain = cleanEmail.endsWith(`@${allowedDomain}`);
    if (!isStudentDomain) {
      const err = `Only university student accounts (@${allowedDomain}) can register. Personal emails are restricted.`;
      setRejectionError(err);
      return { success: false, error: err };
    }

    const fullName = cleanMiddle
      ? `${cleanFirst} ${cleanMiddle} ${cleanSurname}`
      : `${cleanFirst} ${cleanSurname}`;

    if (isFirebaseConfigured && auth && payload.password) {
      try {
        setIsLoading(true);
        const res = await createUserWithEmailAndPassword(auth, cleanEmail, payload.password);
        const profile: UserProfile = {
          id: res.user.uid,
          email: cleanEmail,
          name: fullName,
          firstName: cleanFirst,
          middleName: cleanMiddle || undefined,
          surname: cleanSurname,
          roomNumber: cleanRoom.toLowerCase().startsWith('room') ? cleanRoom : `Room ${cleanRoom}`,
          role: 'STUDENT',
          isDemo: false,
        };
        setUser(profile);
        setRejectionError(null);
        return { success: true };
      } catch (err: unknown) {
        console.warn('Firebase signup fallback:', err);
      } finally {
        setIsLoading(false);
      }
    }

    const newProfile: UserProfile = {
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      name: fullName,
      firstName: cleanFirst,
      middleName: cleanMiddle || undefined,
      surname: cleanSurname,
      roomNumber: cleanRoom.toLowerCase().startsWith('room') ? cleanRoom : `Room ${cleanRoom}`,
      role: 'STUDENT',
      isDemo: true,
    };

    setUser(newProfile);
    setRejectionError(null);
    return { success: true };
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      quickDemoLogin('student');
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
          `Domain Restriction: Google account ${email} is not from @${allowedDomain}.`
        );
        if (auth) {
          await fbSignOut(auth);
        }
      }
    } catch (err: unknown) {
      console.error('Google Sign In Error:', err);
      setRejectionError((err as Error).message || 'Google sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = (role: 'student' | 'admin') => {
    setRejectionError(null);
    setUser(DEMO_PRESETS[role]);
  };

  const logout = () => {
    if (isFirebaseConfigured && auth) {
      fbSignOut(auth).catch(() => {});
    }
    setUser(null);
    setRejectionError(null);
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
        login,
        signUp,
        signInWithGoogle,
        quickDemoLogin,
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
