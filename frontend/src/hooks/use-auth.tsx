import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getAuthToken, setAuthToken } from "@/services/api";
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "@/services/auth";
import type { User } from "@/types/api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!getAuthToken()) {
      setIsLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => setAuthToken(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { user, token } = await loginRequest(email, password);
    setAuthToken(token);
    setUser(user);
    return user;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => {
    const { user, token } = await registerRequest(name, email, password, passwordConfirmation);
    setAuthToken(token);
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  const refresh = async () => {
    if (!getAuthToken()) return;
    const freshUser = await getMe();
    setUser(freshUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
