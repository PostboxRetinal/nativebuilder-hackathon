import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  // Rate limiting
  authRateLimited: () => boolean;
  authResetRateLimit: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // OWASP A07: Rate limiting - 5 attempts per 60s
  const [authAttempts, setAuthAttempts] = useState<
    { ts: number; ip: string }[]
  >([]);

  const AUTH_WINDOW_MS = 60_000;
  const AUTH_MAX_ATTEMPTS = 5;

  const now = Date.now();
  const windowKey = `${now - (now % AUTH_WINDOW_MS)}`;
  const attemptsInWindow = authAttempts.filter(
    (a) => a.ts > now - AUTH_WINDOW_MS,
  ).length;

  const authRateLimited = () => attemptsInWindow >= AUTH_MAX_ATTEMPTS;

  const recordAuthAttempt = () => {
    setAuthAttempts((prev) => [
      ...prev.filter((a) => a.ts > now - AUTH_WINDOW_MS),
      { ts: now, ip: windowKey },
    ]);
  };

  const authResetRateLimit = () => {
    setAuthAttempts([]);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (authRateLimited()) {
      return { error: "Too many attempts. Please try again later." };
    }
    recordAuthAttempt();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (email: string, password: string) => {
    if (authRateLimited()) {
      return { error: "Too many attempts. Please try again later." };
    }
    recordAuthAttempt();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}`,
      },
    });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        authRateLimited,
        authResetRateLimit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
