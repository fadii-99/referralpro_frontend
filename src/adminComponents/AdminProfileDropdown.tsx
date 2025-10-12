import React, { useEffect, useRef, useState } from "react";
import { FiLogOut, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserProvider";
import SmallLoader from "./../components/SmallLoader";

const AdminProfileDropdown: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, loading, loadUser } = useUserContext();

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  // Close on click outside or Esc
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminAccessToken");
    setOpen(false);
    navigate("/AdminLogin");
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

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Trigger: gray circle with user icon */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-10 w-10 rounded-full ring-2 ring-white shadow-sm border border-black/5 bg-gray-100 flex items-center justify-center"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Admin menu"
      >
        {loading ? <SmallLoader /> : <FiUser className="text-gray-400" size={20} />}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-black/5 p-4 z-50"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-2 border-b border-gray-100 pb-4">
            {loading ? (
              <div className="flex-1 flex items-center justify-center h-16">
                <SmallLoader />
              </div>
            ) : (
              <>
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-white shadow">
                  <FiUser className="text-gray-400" size={32} />
                </div>
                <div>
                  <div className="font-semibold text-[#0b0d3b]">
                    {user?.name || "Admin User"}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {user?.email || "admin@example.com"}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          {!loading && (
            <div className="space-y-1 pt-4">
              <Item icon={<FiLogOut />} label="Logout" onClick={handleLogout} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProfileDropdown;
