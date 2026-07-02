'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { ensureUserDoc } from '@/lib/firestore';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (name: string, email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth(), async (u) => {
      if (u) {
        try {
          await ensureUserDoc(u);
        } catch {
          // el doc se reintentará en el siguiente login
        }
      }
      setUser(u);
      setLoading(false);
    });
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    async signInEmail(email, password) {
      await signInWithEmailAndPassword(firebaseAuth(), email, password);
    },
    async signUpEmail(name, email, password) {
      const cred = await createUserWithEmailAndPassword(firebaseAuth(), email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
      await ensureUserDoc(cred.user);
    },
    async signInGoogle() {
      await signInWithPopup(firebaseAuth(), new GoogleAuthProvider());
    },
    async signOut() {
      await fbSignOut(firebaseAuth());
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
