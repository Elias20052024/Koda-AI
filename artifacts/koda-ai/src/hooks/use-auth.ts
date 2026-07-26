import { useState, useEffect } from 'react';

type UserRole = 'student' | 'company' | 'university' | 'admin';

export type User = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
};

export type AuthState = {
  token: string;
  user: User;
} | null;

export function useAuth() {
  const [auth, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem('koda_auth');
    if (stored) {
      try {
        return JSON.parse(stored) as AuthState;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const setAuth = (newAuth: AuthState) => {
    if (newAuth) {
      localStorage.setItem('koda_auth', JSON.stringify(newAuth));
    } else {
      localStorage.removeItem('koda_auth');
    }
    setAuthState(newAuth);
  };

  return { auth, setAuth, logout: () => setAuth(null) };
}
