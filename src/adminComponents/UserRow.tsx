import React from "react";
import { FiTrash2 } from "react-icons/fi";

const Pill: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span className={`inline-flex items-center w-fit px-3 py-1 rounded-lg text-nowrap text-xs sm:text-sm font-medium ${color}`}>
    {label}
  </span>
);

const safe = (v: any, fallback = "—") =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "") ? fallback : v;

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// role → pill colors
const roleColor = (roleRaw: string) => {
  const r = roleRaw.toLowerCase();
  if (r === "superadmin") return "text-red-700 bg-red-50";
  if (r === "company") return "text-blue-700 bg-blue-50";
  if (r === "employee") return "text-purple-700 bg-purple-50";
  if (r === "solo") return "text-amber-700 bg-amber-50";
  return "text-gray-700 bg-gray-100";
};

const UserRow: React.FC<{
  user: any;                          // raw object from API
  onDelete: (id: number | string) => void; // parent handles action (local-only for now)
  deleting?: boolean;                 // optional UI state
}> = ({ user, onDelete, deleting = false }) => {
  const name = String(safe(user?.name, "—"));
  const email = String(safe(user?.email, "—"));
  const company = String(safe(user?.company_name, "")); // empty means “None” pill
  const phone = String(safe(user?.phone, "—"));

  const isActive = Boolean(user?.is_active);
  const isVerified = Boolean(user?.is_verified);

  const statusPill = isActive
    ? { label: "Activated", color: "text-emerald-700 bg-emerald-50" }
    : { label: "Inactive", color: "text-amber-700 bg-amber-50" };

  // 🔴 Unverified is red now
  const verifyPill = isVerified
    ? { label: "Verified", color: "text-blue-700 bg-blue-50" }
    : { label: "Unverified", color: "text-red-700 bg-red-50" };

  const roleRaw = String(safe(user?.role, "—"));
  const roleLabel = roleRaw.toLowerCase() === "superadmin" ? "Admin" : capitalize(roleRaw);
  const rolePillColor = roleColor(roleRaw);

  return (
    <div
      className="grid min-w-[1100px]
                 grid-cols-[1.2fr_1.4fr_1.2fr_0.9fr_1.1fr_1fr_0.8fr_auto]
                 items-center bg-white rounded-2xl px-6 py-3 border border-black/5 
                 shadow-sm hover:shadow-md transition"
    >
      {/* Name */}
      <div className="text-gray-800 font-medium md:text-sm text-xs truncate">{name}</div>

      {/* Email */}
      <div className="text-gray-700 md:text-sm text-xs truncate">{email}</div>

      {/* Company */}
      <div className="md:text-sm text-xs truncate">
        {company
          ? <span className="text-gray-700">{company}</span>
          : <Pill label="None" color="text-gray-700 bg-gray-100" />
        }
      </div>

      {/* Status (is_active) */}
      <div className="md:text-sm text-xs">
        <Pill label={statusPill.label} color={statusPill.color} />
      </div>

      {/* Verification (is_verified) */}
      <div className="md:text-sm text-xs">
        <Pill label={verifyPill.label} color={verifyPill.color} />
      </div>

      {/* Phone */}
      <div className="text-gray-700 md:text-sm text-xs truncate">{phone}</div>

      {/* Role (pill with colors) */}
      <div className="md:text-sm text-xs">
        <Pill label={roleLabel} color={rolePillColor} />
      </div>

      {/* Action */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          title="Delete user"
          disabled={deleting}
          onClick={() => onDelete(user?.id)}
          className={`h-9 w-9 rounded-lg border border-black/5 bg-white flex items-center justify-center shadow-sm
            ${deleting ? "opacity-60 cursor-not-allowed" : "hover:bg-red-50"}`}
        >
          <FiTrash2 className="text-red-500 text-lg" />
        </button>
      </div>
    </div>
  );
};

export default UserRow;
