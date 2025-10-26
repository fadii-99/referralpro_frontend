// src/components/ReferralRow.tsx
import React from "react";
import { FiEye } from "react-icons/fi";

export type Referral = {
  id: string;
  reference_id: string;
  referred_to_name: string;
  industry: string; // 👈 Service Type
  assigned_to_name: string | null;
  status: string;
  urgency: string;
};

// 🎨 Available fallback colors (for unknown values)
const colors = [
  "text-rose-700 bg-rose-50",
  "text-blue-700 bg-blue-50",
  "text-amber-700 bg-amber-50",
  "text-emerald-700 bg-emerald-50",
  "text-purple-700 bg-purple-50",
  "text-gray-700 bg-gray-100",
];

const pickColor = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  // normalize: case-insensitive + treat "_" like space
  const raw = (status || "").trim();
  const key = raw.toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ");

  // colors:
  // in progress => violet, pending => amber, friend opted in => blue
  // completed => green, cancelled => red, default => gray
  const map: Record<string, string> = {
    "in progress": "text-violet-500 bg-violet-50",
    pending: "text-amber-500 bg-amber-50",
    "friend opted in": "text-blue-500 bg-blue-50",
    completed: "text-emerald-700 bg-emerald-50",
    cancelled: "text-rose-700 bg-rose-50",
  };

  const style = map[key] || "text-gray-700 bg-gray-100";

  return (
    <span
      className={`inline-flex items-center w-fit px-3 py-1 rounded-lg text-nowrap text-xs sm:text-sm font-medium capitalize ${style}`}
    >
      {status}
    </span>
  );
};


const UrgencyPill: React.FC<{ urgency: string }> = ({ urgency }) => {
  const map: Record<string, string> = {
    urgent: "text-rose-700 bg-rose-50",
    normal: "text-blue-700 bg-blue-50",
    medium: "text-amber-700 bg-amber-50",
  };
  const style = map[(urgency || "").toLowerCase()] || pickColor(urgency || "");

  return (
    <span
      className={`inline-flex items-center w-fit px-3 py-1 rounded-lg text-nowrap text-xs sm:text-sm font-medium capitalize ${style}`}
    >
      {urgency}
    </span>
  );
};



const AssignedRepPill: React.FC<{ label: string }> = ({ label }) => {
  const raw = (label || "").trim();
  const lower = raw.toLowerCase();

  let style = "text-blue-700 bg-blue-50"; // default for normal names (blue)
  let text = raw || "none";

  if (lower === "self") {
    // 🔶 make self yellow/amber
    style = "text-amber-500 bg-amber-50";
    text = "self";
  } else if (lower === "none" || raw === "") {
    style = "text-rose-700 bg-rose-50"; // none = red
    text = "-";
  }

  return (
    <span
      className={`inline-flex items-center w-fit px-3 py-1 rounded-lg text-nowrap text-xs sm:text-sm font-medium capitalize ${style}`}
    >
      {text}
    </span>
  );
};


const ReferralRow: React.FC<{
  referral: Referral;
  onClick?: () => void;
  onView?: () => void;
}> = ({ referral, onClick, onView }) => {
  const assignedLabel = referral.assigned_to_name || "none";

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-[160px_200px_1fr_1fr_1fr_1fr_60px] min-w-[900px] 
               items-center bg-white rounded-2xl px-6 py-3 border border-black/5 
               shadow-sm cursor-pointer hover:shadow-md transition"
    >
      {/* ID */}
      <div className="font-medium text-gray-700 md:text-sm text-xs text-left">
        {referral.reference_id}
      </div>

      {/* Customer Name */}
      <div className="font-medium text-gray-700 md:text-sm text-xs text-left">
        {referral.referred_to_name}
      </div>

      {/* Service Type */}
      <div className="text-gray-600 md:text-sm text-xs text-left">
        {referral.industry}
      </div>

      {/* Assigned Rep → always pill now */}
      <div className="md:text-sm text-xs text-left">
        <AssignedRepPill label={assignedLabel} />
      </div>

      {/* Status */}
      <StatusPill status={referral.status} />

      {/* Priority */}
      <UrgencyPill urgency={referral.urgency} />

      {/* Actions */}
      <div className="flex justify-end pr-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          aria-label="View"
          className="text-primary-purple hover:opacity-80"
          onClick={onView}
        >
          <FiEye className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default ReferralRow;
