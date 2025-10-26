import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";

export type SimpleNotification = {
  id?: number | string;
  text: string;
  time: string; // ISO string
};

type Ctx = {
  loading: boolean;
  error: string | null;
  connected: boolean;
  notifications: SimpleNotification[];
  fetchNotifications: (opts?: { page?: number; page_size?: number; unread_only?: boolean }) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
  acknowledgeNew: () => void;
  hasNew: boolean;
};

const NotificationContext = createContext<Ctx | null>(null);
export const useNotificationContext = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotificationContext must be used inside provider");
  return ctx;
};

const serverUrl = import.meta.env.VITE_SERVER_URL;

// logs
const TAG = "[notifications]";
const log  = (...a: any[]) => console.log(TAG, ...a);
const warn = (...a: any[]) => console.warn(TAG, ...a);
const err  = (...a: any[]) => console.error(TAG, ...a);

// storage helpers
const getAccessToken = () => localStorage.getItem("accessToken");
const getUserId      = () => localStorage.getItem("userId");

// ✅ allow any event_type that contains "referral" (case-insensitive)
const matchesReferral = (obj: any) => {
  const et = String(obj?.event_type || obj?.type || "").toLowerCase();
  return et.includes("referral");
};

/** Resolve HTTP base from VITE_SERVER_URL (supports "/api" or absolute) */
function getHttpBase(): string {
  const raw = (serverUrl || "").trim();
  if (!raw) return window.location.origin;
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, "");
  return (window.location.origin + "/" + raw.replace(/^\/+/, "")).replace(/\/+$/, "");
}

/** Build WS URL for /ws/notifications/:userId/ and append token as query */
function buildWsUrl(userId: string | number, token: string): string {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  let url = `${proto}//${host}/api/ws/notifications/${userId}/`;
  if (token) url += `?token=${encodeURIComponent(token)}`;
  return url;
}

/** Normalize server payload into minimal shape */
function normalizePayload(p: any): SimpleNotification {
  const text = [p?.title, p?.message, p?.event].filter(Boolean).join(" — ") || "Notification";
  const time = p?.created_at || new Date().toISOString();
  const id = p?.id;
  return { id, text, time };
}

const CAP = 500;

export const NotificationProvider: React.FC<{ children: React.ReactNode; alertOnIncoming?: boolean }> = ({
  children,
  alertOnIncoming = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  const [hasNew, setHasNew] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const backoffRef = useRef(1000);
  const manualCloseRef = useRef(false);

  /** REST list — fetch everything, then client-filter to referral */
  const fetchNotifications = useCallback(
    async (opts?: { page?: number; page_size?: number; unread_only?: boolean }) => {
      const token = getAccessToken();
      if (!token) {
        warn("fetchNotifications: no accessToken");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const base = getHttpBase();
        const page = String(opts?.page ?? 1);
        const page_size = String(opts?.page_size ?? 50);
        const unread_only = typeof opts?.unread_only === "boolean" ? `&unread_only=${String(opts.unread_only)}` : "";
        const url = `${base}/notifications/?page=${encodeURIComponent(page)}&page_size=${encodeURIComponent(page_size)}${unread_only}`;

        // log("🔹 REST GET:", url);

        const res = await fetch(url, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });

        // log("🔹 REST STATUS:", res.status, res.statusText);

        const ct = res.headers.get("content-type") || "";
        const readBody = async () => {
          if (ct.includes("application/json")) {
            try {
              return await res.json();
            } catch (e) {
              err("❌ JSON parse error:", e);
            }
          }
          try {
            return await res.text();
          } catch {
            return null;
          }
        };

        if (!res.ok) {
          const body = await readBody();
          warn("⚠️ Non-OK response body:", body);
          const msg =
            (body && typeof body === "object" && (body.error || body.detail || body.message)) ||
            (typeof body === "string" && body) ||
            res.statusText ||
            "Request failed";
          throw new Error(`HTTP ${res.status} ${msg}`);
        }

        const body = await readBody();
        // log("📦 RAW BODY:", body);

        const data = (body && typeof body === "object" ? body : { notifications: [] }) as any;

        const raw: any[] = Array.isArray(data?.notifications)
          ? data.notifications
          : Array.isArray((data as any)?.results)
          ? (data as any).results
          : [];

        // log("📋 RAW notifications length:", raw.length);
        // log("📋 RAW notifications list:", raw);

        const onlyReferral = raw.filter(matchesReferral);
        // log("🎯 Filtered referral notifications:", onlyReferral.length, onlyReferral);

        const mapped: SimpleNotification[] = onlyReferral.map((n) => ({
          id: n.id,
          text: [n.title, n.message].filter(Boolean).join(" — ") || "Notification",
          time: n.created_at || new Date().toISOString(),
        }));

        // log("✅ Final mapped notifications:", mapped);

        setNotifications(mapped.slice(0, CAP));
        // log(`REST mapped referral notifications: ${mapped.length}`);
      } catch (e: any) {
        const msg = e?.message || "Network error";
        setError(msg);
        err("REST exception:", msg, e);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /** cleanup WS */
  const cleanupWs = useCallback(() => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
  }, []);

  /** reconnect with backoff */
  const scheduleReconnect = useCallback(() => {
    if (manualCloseRef.current) return;
    const delay = Math.min(backoffRef.current, 30000);
    warn(`WS reconnect in ${delay}ms`);
    if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = window.setTimeout(() => {
      connectSocket();
      backoffRef.current = Math.min(backoffRef.current * 2, 30000);
    }, delay);
  }, []);

  /** connect WS — send token via query, alert only on referral events */
  const connectSocket = useCallback(() => {
    const token = getAccessToken();
    const userId = getUserId();
    if (!token || !userId) {
      warn("connectSocket: missing token or userId", { token: !!token, userId });
      return;
    }

    cleanupWs();
    manualCloseRef.current = false;

    const wsUrl = buildWsUrl(userId, token);
    log("🔌 WS connecting →", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      backoffRef.current = 1000;
      try {
        ws.send(JSON.stringify({ type: "ping", ts: Date.now() }));
      } catch {}
      // log("✅ WS connected");
    };

    ws.onmessage = (evt) => {
      log("💬 WS message (raw):", evt.data);

      let payload: any;
      try {
        payload = JSON.parse(evt.data);
      } catch {
        return; // ignore non-JSON
      }

      // log("💡 WS parsed payload:", payload);

      if (!matchesReferral(payload)) {
        log("⛔ Ignored non-referral event:", payload.event_type || payload.type);
        return;
      }

      if (alertOnIncoming) {
        const txt = [payload?.title, payload?.message, payload?.event]
          .filter(Boolean)
          .join(" — ") || "Notification";
        try {
          window.alert(txt);
        } catch {}
      }

      const item = normalizePayload(payload);
      // log("🆕 New notification:", item);

      setNotifications((prev) => {
        const updated = [item, ...prev].slice(0, CAP);
        // log("📥 Updated notification list:", updated);
        return updated;
      });
      setHasNew(true);
    };

    ws.onerror = (e) => {
      warn("⚠️ WS error:", e);
      setConnected(false);
    };

    ws.onclose = (e) => {
      console.groupCollapsed("[WS close]");
      console.log("reason:", e.reason);
      console.groupEnd();
      setConnected(false);
      if (!manualCloseRef.current) scheduleReconnect();
    };
  }, [cleanupWs, scheduleReconnect, alertOnIncoming]);

  

  const disconnectSocket = useCallback(() => {
    manualCloseRef.current = true;
    // log("🔻 WS manual disconnect");
    cleanupWs();
    setConnected(false);
  }, [cleanupWs]);

  const acknowledgeNew = useCallback(() => setHasNew(false), []);



  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, []);



  const value = useMemo(
    () => ({
      loading,
      error,
      connected,
      notifications,
      hasNew,
      fetchNotifications,
      connectSocket,
      disconnectSocket,
      acknowledgeNew,
    }),
    [loading, error, connected, notifications, hasNew, fetchNotifications, connectSocket, disconnectSocket, acknowledgeNew]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
