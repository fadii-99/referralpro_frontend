// src/context/ReferralProvider.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import type { Referral } from "../components/ReferralRow";

type Ctx = {
  loading: boolean;
  error: string | null;
  referrals: Referral[];
  loadReferrals: () => Promise<void>;
};

const ReferralContext = createContext<Ctx | null>(null);

export const useReferralContext = () => {
  const ctx = useContext(ReferralContext);
  if (!ctx) throw new Error("useReferralContext must be used inside provider");
  return ctx;
};

const serverUrl = import.meta.env.VITE_SERVER_URL;

// Router-agnostic 401 redirect
const redirectToRoot = () => {
  try {
    localStorage.clear();
  } catch {}
  window.location.replace("/");
};

export const ReferralProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  const loadReferrals = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      // no token => behave logged-out (don't redirect from here)
      setReferrals([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${serverUrl}/refer/list_company_referral/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // ⛔ 401 -> clear + hard redirect
      if (res.status === 401) {
        setReferrals([]);
        redirectToRoot();
        return;
      }

      if (!res.ok) {
        const errTxt = await res.text();
        const msg = `Error ${res.status}: ${errTxt || res.statusText}`;
        setError(msg);
        setReferrals([]);
        return;
      }

      const data = await res.json();
      const arr = Array.isArray(data?.referrals) ? data.referrals : [];

      const mapped: Referral[] = arr.map((r: any) => ({
        id: String(r.id),
        reference_id: r.reference_id ?? "",
        referred_to_name: r.referred_to_name ?? "—",
        industry: r.industry ?? "—",
        assigned_to_name: r.assigned_to_name ?? null,
        status: r.status ?? "—",
        urgency: r.urgency ?? "—",
      }));

      setReferrals(mapped);
    } catch (err: any) {
      console.error("[referrals_list] network error:", err);
      const msg = err?.message || "Network error";
      setError(msg);
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReferrals();
  }, [loadReferrals]);

  const value = useMemo(
    () => ({ loading, error, referrals, loadReferrals }),
    [loading, error, referrals, loadReferrals]
  );

  return (
    <ReferralContext.Provider value={value}>
      {children}
    </ReferralContext.Provider>
  );
};
