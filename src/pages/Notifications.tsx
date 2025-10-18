// src/pages/Notifications.tsx
import React, { useEffect, useMemo, useState } from "react";
import SmallLoader from "./../components/SmallLoader";
import Pagination from "./../components/Pagination";

type ApiNotification = {
  id: number | string;
  title?: string | null;
  message?: string | null;
  created_at?: string | null;
  event_type?: string | null;
};



// type ApiResponse = {
//   success: boolean;
//   notifications: ApiNotification[];
//   pagination: {
//     page: number;
//     page_size: number;
//     total_count: number;
//     unread_count: number;
//     has_more: boolean;
//   };
// };



type Row = {
  id: string;
  text: string;
  timeISO: string;
};

const serverUrl = import.meta.env.VITE_SERVER_URL;
const getAccessToken = () => localStorage.getItem("accessToken");

const normalize = (n: ApiNotification): Row => ({
  id: String(n.id),
  text: [n.title, n.message].filter(Boolean).join(" — ") || "Notification",
  timeISO: n.created_at || new Date().toISOString(),
});

const fmtTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
};


const isReferralRow = (n: ApiNotification) =>
  String(n?.event_type || "").toLowerCase().includes("referral");

const Notifications: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize]
  );

  const fetchPage = async (pageNum: number) => {
    const token = getAccessToken();
    if (!token) {
      setError("Not authenticated");
      setInitialLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rawBase = (serverUrl || "").trim();
      const apiBase = /^https?:\/\//i.test(rawBase)
        ? rawBase.replace(/\/+$/, "")
        : (window.location.origin + "/" + rawBase.replace(/^\/+/, "")).replace(/\/+$/, "");

      const listUrl =
        `${apiBase}/notifications/?page=${encodeURIComponent(String(pageNum))}` +
        `&page_size=${encodeURIComponent(String(pageSize))}`;

      const res = await fetch(listUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const ct = res.headers.get("content-type") || "";
      const readBody = async () => {
        if (ct.includes("application/json")) {
          try {
            return await res.json();
          } catch {}
        }
        try {
          return await res.text();
        } catch {
          return null;
        }
      };

      if (!res.ok) {
        const body = await readBody();
        const msg =
          (body && typeof body === "object" && (body.error || body.detail || body.message)) ||
          (typeof body === "string" && body) ||
          res.statusText ||
          "Request failed";
        throw new Error(`HTTP ${res.status} ${msg}`);
      }

      const body = await readBody();
      const data =
        body && typeof body === "object"
          ? body
          : { notifications: [], pagination: {} };

      // ✅ support both "notifications" and "results" keys
      const allNotifications = Array.isArray((data as any).notifications)
        ? (data as any).notifications
        : Array.isArray((data as any).results)
        ? (data as any).results
        : [];

      // referral-only filter
      const onlyReferral = allNotifications.filter(isReferralRow);
      const mapped = onlyReferral.map(normalize);

      setRows(mapped);

      const fallbackPageCount = mapped.length;
      setTotalCount(Number((data as any).pagination?.total_count) || fallbackPageCount);
      setPage(Number((data as any).pagination?.page) || pageNum);
    } catch (e: any) {
      setError(e?.message || "Failed to load notifications");
      setRows([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const onPageChange = (p: number) => {
    if (p === page) return;
    void fetchPage(p);
    try {
      document.querySelector("#notifications-root")?.scrollIntoView({ behavior: "smooth" });
    } catch {}
  };

  useEffect(() => {
    void fetchPage(1);
  }, []);



  return (
    <div id="notifications-root" className="sm:p-6 p-3">
      <div className="flex items-center justify-between">
        <h2 className="md:text-2xl text-xl font-semibold text-primary-blue sm:pb-4 pb-0">
          Notifications
        </h2>
      </div>

      <div className="mt-4 bg-white rounded-2xl shadow-sm border border-black/5 p-4 sm:p-5">
        {initialLoading && (
          <div className="py-10 flex items-center justify-center">
            <SmallLoader />
          </div>
        )}

        {!initialLoading && error && (
          <div className="px-2 py-3 text-sm text-red-600">{error}</div>
        )}

        {!initialLoading && !error && rows.length === 0 && (
          <div className="px-2 py-3 text-sm text-gray-500">
            No notifications found.
          </div>
        )}

        {!initialLoading && !error && rows.length > 0 && (
          <>
            <ul className="space-y-3">
              {rows.map((n) => (
                <li
                  key={n.id}
                  className="bg-white rounded-2xl border border-gray-200 px-4 py-3 sm:py-4 flex items-center gap-3"
                >
                  <span className="h-9 w-9 rounded-xl bg-primary-purple/10 text-primary-purple grid place-items-center shrink-0">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="6" y="4" width="12" height="16" rx="2" />
                      <path d="M8 8h8M8 12h8M8 16h5" />
                    </svg>
                  </span>
                  <div className="flex-1">
                    <p className="md:text-sm text-xs text-primary-blue leading-snug">
                      {n.text}
                    </p>
                  </div>
                  <div className="sm:text-xs text-[10px] text-gray-400 shrink-0">
                    {fmtTime(n.timeISO)}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, totalCount)} of {totalCount}
              </span>

              <Pagination
                current={page}
                totalPages={totalPages}
                onChange={onPageChange}
              />
            </div>

            {loading && (
              <div className="mt-4 flex items-center justify-center">
                <SmallLoader />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
