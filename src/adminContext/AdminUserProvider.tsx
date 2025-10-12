// src/context/UserProvider.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";

type Ctx = {
  loading: boolean;
  error: string | null;
  data: any;                 // raw payload from /super/users
  loadUsers: () => Promise<void>;
};

const AdminUserContext = createContext<Ctx | null>(null);

export const useAdminUserContext = () => {
  const ctx = useContext(AdminUserContext);
  if (!ctx) throw new Error("useAdminUserContext must be used inside provider");
  return ctx;
};

const serverUrl = import.meta.env.VITE_SERVER_URL;
const ADMIN_USERS_PATH = "/super/users/"; // adjust if different

export const AdminUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [data, setData]     = useState<any>(null); // store raw response

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supertoken = localStorage.getItem("adminAccessToken");
     if (!supertoken) return
    try {
      const res = await fetch(`${serverUrl}${ADMIN_USERS_PATH}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: supertoken ? `Bearer ${supertoken}` : "",
        },
      });

      const body = await res.json().catch(() => ({}));
      console.log("[/super/users raw response]:", body);

      if (!res.ok) {
        const msg =
          body?.error ||
          (res.status === 401
            ? "Unauthorized (adminAccessToken missing/expired)."
            : res.status === 403
            ? "Forbidden (superadmin required)."
            : `Request failed with status ${res.status}`);
        setError(msg);
        setData(body || null);
        return;
      }


      setData(body); // keep raw
    } catch (e) {
      console.error("[/super/users] network error:", e);
      setError("Network error while loading admin users.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const value = useMemo(() => ({ loading, error, data, loadUsers }), [
    loading, error, data, loadUsers,
  ]);

  return <AdminUserContext.Provider value={value}>{children}</AdminUserContext.Provider>;
};
