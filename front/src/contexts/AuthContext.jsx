import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchIdentity } from "../api/identity";
import { TOKEN_KEY } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [identity, setIdentity] = useState({ registered: false, loading: true });

  const refresh = useCallback(async () => {
    try {
      const data = await fetchIdentity();
      setIdentity({ registered: !!data?.registered, loading: false });
    } catch {
      setIdentity({ registered: false, loading: false });
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const onTokenChanged = () => { refresh(); };
    window.addEventListener("auth:token-changed", onTokenChanged);
    return () => window.removeEventListener("auth:token-changed", onTokenChanged);
  }, [refresh]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === TOKEN_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ identity, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
