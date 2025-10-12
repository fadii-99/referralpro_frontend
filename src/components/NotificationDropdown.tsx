import React, { useEffect, useRef, useState } from "react";
import { HiOutlineBell } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useNotificationContext } from "./../context/NotificationProvider";
import SmallLoader from "./../components/SmallLoader";

function formatClock(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

const NotificationDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    notifications,
    hasNew,
    acknowledgeNew,
    connected,
    loading,
    error,
    fetchNotifications,
  } = useNotificationContext();

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggleOpen = () => setOpen((prev) => !prev);

  // When opening → fetch the latest list and clear red dot
  useEffect(() => {
    if (open) {
      acknowledgeNew();
      fetchNotifications({ page: 1, page_size: 20 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const goAll = () => {
    setOpen(false);
    navigate("/Dashboard/Notifications?filter=referral");
  };

  const topFive = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleOpen}
        className={[
          "h-10 w-10 rounded-2xl border border-black/5 flex items-center justify-center transition shadow-sm",
          open ? "bg-primary-blue text-white hover:opacity-95" : "bg-white hover:shadow",
        ].join(" ")}
        aria-label="Notifications"
        aria-expanded={open}
        title={connected ? "Notifications (live)" : "Notifications (reconnecting…)"}
      >
        <HiOutlineBell className={open ? "text-white text-xl" : "text-primary-purple text-xl"} />
      </button>

      {hasNew && !open && (
        <span
          className={[
            "absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full ring-2",
            "bg-red-500",
            "ring-[#f3f2fa]",
          ].join(" ")}
        />
      )}

      {open && (
        <div
          className="absolute right-0 mt-3 w-[22rem] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden"
          role="dialog"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h4 className="sm:text-lg text-sm font-semibold text-gray-900">Notifications</h4>
            <button
              type="button"
              onClick={goAll}
              className="text-primary-purple sm:text-xs text-[10px] font-medium hover:underline hover:underline-offset-4"
            >
              View All
            </button>
          </div>

          {loading && (
            <div className="px-5 py-6 flex items-center justify-center">
              <SmallLoader />
            </div>
          )}

          {!!error && !loading && (
            <div className="px-5 py-4 text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && topFive.length === 0 && (
            <div className="px-5 py-4 text-sm text-gray-500">No notifications yet.</div>
          )}

          {!loading && !error && topFive.length > 0 && (
            <ul className="divide-y divide-gray-200">
              {topFive.map((n, idx) => (
                <li key={String(n.id ?? `${n.time}-${idx}`)} className="px-5 py-4 flex items-start gap-3">
                  <span className="h-9 w-9 rounded-xl bg-primary-purple/10 text-primary-purple grid place-items-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="6" y="4" width="12" height="16" rx="2" />
                      <path d="M8 8h8M8 12h8M8 16h5" />
                    </svg>
                  </span>
                  <div className="flex-1">
                    <p className="md:text-sm text-xs text-primary-blue leading-snug">{n.text}</p>
                    <div className="sm:text-xs text-[10px] text-gray-400 mt-2">{formatClock(n.time)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};


export default NotificationDropdown;
