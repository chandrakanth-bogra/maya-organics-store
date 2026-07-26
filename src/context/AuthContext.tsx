"use client";

import { createContext, useContext } from "react";
import { authClient, useSession, signOut as authSignOut } from "@/lib/auth-client";

type SessionUser = typeof authClient.$Infer.Session.user;

type AuthContextType = {
  user: SessionUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending } = useSession();

  const signOut = async () => {
    await authSignOut();
  };

  return (
    <AuthContext.Provider value={{ user: data?.user ?? null, loading: isPending, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
