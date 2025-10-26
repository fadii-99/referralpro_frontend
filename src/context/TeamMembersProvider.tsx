// src/context/TeamMembersProvider.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
// import { toast } from "react-toastify";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: string;
  lastActive: string;
  phone?: string;
};

type Ctx = {
  loading: boolean;
  error: string | null;
  membersFromApi: TeamMember[];
  loadTeam: () => Promise<void>;
};

const TeamMembersContext = createContext<Ctx | null>(null);

export const useTeamMembersContext = () => {
  const ctx = useContext(TeamMembersContext);
  if (!ctx)
    throw new Error(
      "useTeamMembersContext must be used within <TeamMembersProvider>"
    );
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

export const TeamMembersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [membersFromApi, setMembersFromApi] = useState<TeamMember[]>([]);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setMembersFromApi([]);
        setLoading(false);
        return;
      }

      const res = await fetch(`${serverUrl}/auth/employees/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // ⛔ 401 -> clear + hard redirect
      if (res.status === 401) {
        setMembersFromApi([]);
        redirectToRoot();
        return;
      }

      if (!res.ok) {
        const errTxt = await res.text();
        const msg = `Failed (${res.status}) - ${errTxt || "Unknown error"}`;
        setError(msg);
        setMembersFromApi([]);
        return;
      }

      const data = await res.json();
      const arr = Array.isArray(data?.employees) ? data.employees : [];

      const mapped: TeamMember[] = arr.map((emp: any) => ({
        id: String(emp.id),
        name: emp.full_name || "Unknown",
        email: emp.email,
        avatar: `https://i.pravatar.cc/96?u=${emp.email}`,
        role: emp.role || "Unknown",
        status: emp.is_active ? "Active" : "Inactive",
        lastActive: emp.last_login
          ? new Date(emp.last_login).toLocaleDateString()
          : "—",
        phone: emp.phone ?? "—",
      }));

      setMembersFromApi(mapped);
    } catch (err: any) {
      setError("Network error");
      setMembersFromApi([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // first load
  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  const value = useMemo(
    () => ({ loading, error, membersFromApi, loadTeam }),
    [loading, error, membersFromApi, loadTeam]
  );

  return (
    <TeamMembersContext.Provider value={value}>
      {children}
    </TeamMembersContext.Provider>
  );
};
