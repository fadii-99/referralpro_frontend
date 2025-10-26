// src/context/UserProvider.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";

export type UserInfo = {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  phone?: string;

  // Business info
  company_name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  us_state?: string;
  post_code?: string;
  website?: string;
  industry?: string;
  employees?: string;
  biz_type?: string;
};

type Ctx = {
  loading: boolean;
  error: string | null;
  user: UserInfo | null;
  loadUser: () => Promise<void>;
};

const UserContext = createContext<Ctx | null>(null);

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used within <UserProvider>");
  return ctx;
};

const serverUrl = import.meta.env.VITE_SERVER_URL;

// hard redirect (works even if provider is outside any Router)
const redirectToRoot = () => {
  try {
    localStorage.clear();
  } catch {}
  // replace so user can't go "Back" into a broken authed state
  window.location.replace("/");
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${serverUrl}/auth/get_user/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (res.status === 401) {
        setUser(null);
        setError("Unauthorized");
        redirectToRoot();
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(`Failed (${res.status})`);
        setUser(null);
        return;
      }

      // Function to generate initials from name
      const makeAvatarUrl = (fullName: string) => {
        const parts = (fullName || "").trim().split(" ").filter(Boolean);
        let initials = "";
        if (parts.length >= 2) initials = `${parts[0][0]}${parts[1][0]}`;
        else if (parts.length === 1) initials = parts[0][0];
        else initials = "U";
        return `https://ui-avatars.com/api/?name=${initials.toUpperCase()}&background=E5E7EB&color=374151`;
      };

      // ✅ Merge user + business_info
      const mapped: UserInfo = {
        id: String(data?.user?.id || ""),
        name: data?.user?.full_name || "Unknown",
        email: data?.user?.email || "",
        phone: data?.user?.phone || "",
        role: data?.user?.role || "Member",
        avatar: data?.user?.image || makeAvatarUrl(data?.user?.full_name || "User"),

        company_name: data?.user?.business_info?.company_name || "",
        address1: data?.user?.business_info?.address1 || "",
        address2: data?.user?.business_info?.address2 || "",
        city: data?.user?.business_info?.city || "",
        us_state: data?.user?.business_info?.us_state || "",
        post_code: data?.user?.business_info?.post_code || "",
        website: data?.user?.business_info?.website || "",
        industry: data?.user?.business_info?.industry || "",
        employees: data?.user?.business_info?.employees || "",
        biz_type: data?.user?.business_info?.biz_type || "",
      };

      localStorage.setItem("userId", mapped.id);
      localStorage.setItem("userBizType", (mapped.biz_type || "").trim().toLowerCase());

      setUser(mapped);
    } catch (err) {
      console.error("[UserProvider] network error:", err);
      setError("Network error");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const value = useMemo(() => ({ loading, error, user, loadUser }), [loading, error, user, loadUser]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
