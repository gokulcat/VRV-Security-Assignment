import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAuthClient } from "../services/neonAuth";
import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const sessionResult = await getAuthClient().getSession();
        if (sessionResult.error) {
          throw new Error(sessionResult.error.message || "Could not restore your session");
        }
        if (sessionResult.data?.user) {
          const profileResult = await apiRequest("/api/auth/me");
          if (!cancelled) {
            setUser(profileResult.user);
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Could not restore authentication session:", error);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((profile) => {
    setUser(profile);
  }, []);

  const logout = useCallback(async () => {
    const result = await getAuthClient().signOut();
    if (result.error) {
      throw new Error(result.error.message || "Could not sign out");
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
