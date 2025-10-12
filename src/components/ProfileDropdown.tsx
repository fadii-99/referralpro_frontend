import React, { useEffect, useRef, useState } from "react";
import { FiSettings, FiCreditCard, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserProvider";
import SmallLoader from "./SmallLoader";

const ProfileDropdown: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null); // ✅ single ref wrapper
  const navigate = useNavigate();
  const { user, loading, loadUser } = useUserContext();

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const goProfile = () => {
    setOpen(false);
    navigate("/Dashboard/Profile");
  };

  // ✅ close on outside click + ESC
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = wrapperRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setOpen(false);
    navigate("/Login");
  };

  const Item = ({
    icon,
    label,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary-purple/5 rounded-lg transition"
    >
      <span className="text-primary-purple text-lg">{icon}</span>
      <span className="text-xs font-medium text-[#0b0d3b]">{label}</span>
    </button>
  );

  const avatarSrc =
    user?.avatar ||
    "https://referal-pro-bucket.s3.amazonaws.com/media/profiles/Capture.PNG";

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white shadow-sm border border-black/5"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full w-full bg-gray-100">
            <SmallLoader />
          </div>
        ) : (
          <img src={avatarSrc} alt="User avatar" className="h-full w-full object-cover" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-black/5 p-4 z-50"
        >
          <div className="flex items-center gap-3 px-2 border-b border-gray-100 pb-4">
            {loading ? (
              <div className="flex-1 flex items-center justify-center h-16">
                <SmallLoader />
              </div>
            ) : (
              <>
                <img
                  src={avatarSrc}
                  alt="User avatar"
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow"
                />
                <div>
                  <div className="font-semibold text-[#0b0d3b]">{user?.name || "Unknown"}</div>
                  <div className="text-[11px] text-gray-500">{user?.email}</div>
                  <button
                    type="button"
                    onClick={goProfile}
                    className="text-xs text-primary-purple hover:underline pt-4"
                  >
                    View Profile
                  </button>
                </div>
              </>
            )}
          </div>

          {!loading && (
            <div className="space-y-1 pt-4">
              <Item icon={<FiSettings />} label="Setting" />
              <div className="h-px bg-gray-200 my-2" />
              <Item icon={<FiCreditCard />} label="Subscription & Billing" />
              <div className="h-px bg-gray-200 my-2" />
              <Item icon={<FiLogOut />} label="Logout" onClick={handleLogout} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
