import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthState, AuthUser, clearAuth, fetchMe, getStoredAuth, login as loginRequest, register as registerRequest } from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredAuth();
    if (!stored) {
      setLoading(false);
      return;
    }

    fetchMe(stored.token)
      .then((user) => {
        setAuth({ token: stored.token, user });
      })
      .catch(() => {
        clearAuth();
        setAuth(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const state = await loginRequest(email, password);
    setAuth(state);
  };

  const register = async (name: string, email: string, password: string) => {
    const state = await registerRequest(name, email, password);
    setAuth(state);
  };

  const logout = () => {
    clearAuth();
    setAuth(null);
  };

  const value = useMemo(
    () => ({ user: auth?.user ?? null, token: auth?.token ?? null, loading, login, register, logout }),
    [auth, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
