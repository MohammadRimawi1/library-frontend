import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { api, setAuth, clearAuth, getToken, getStoredUser } from '@/lib/api';
import type { User, Role } from '@/types';

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  token: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
  }) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser<User>());

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<LoginResponse>(
      '/auth/login',
      { email, password },
      undefined,
    );
    setAuth(data.token, data.user);
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      phoneNumber: string;
    }) => {
      const res = await api.post<RegisterResponse>(
        '/auth/register',
        data,
        undefined,
      );
      setAuth(res.token, res.user);
      setUser(res.user);
    },
    [],
  );

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: Role[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user && !!getToken(), login, register, logout, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
