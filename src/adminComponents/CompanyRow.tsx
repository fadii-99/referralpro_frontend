// src/adminComponents/CompanyRow.tsx
import React from "react";
import type { Company } from "../adminContext/AdminCompanyProvider";

const Pill: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span
    className={`inline-flex items-center w-fit px-3 py-1 rounded-lg text-nowrap text-xs sm:text-sm font-medium capitalize ${color}`}
  >
    {label}
  </span>
);

const CompanyRow: React.FC<{ company: Company }> = ({ company }) => {
  const statusColor =
    company.status === "Compliant"
      ? "text-purple-700 bg-purple-50"
      : "text-amber-700 bg-amber-50";

  const paymentColor =
    company.payment === "Paid"
      ? "text-emerald-700 bg-emerald-50"
      : "text-rose-700 bg-rose-50";

  return (
    <div
      className="grid grid-cols-[200px_200px_150px_150px_150px_150px_120px] min-w-[1100px]
                 items-center bg-white rounded-2xl px-6 py-3 border border-black/5 
                 shadow-sm hover:shadow-md transition"
    >
      {/* Company Name */}
      <div className="flex items-center gap-3 font-medium text-gray-700 md:text-sm text-xs">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            company.name
          )}&background=0b0d3b&color=fff`}
          alt={company.name}
          className="w-8 h-8 rounded-full"
        />
        <span>{company.name}</span>
      </div>

      {/* Industry */}
      <div className="text-blue-600 font-medium md:text-sm text-xs">
        {company.industry}
      </div>

      {/* Status */}
      <Pill label={company.status} color={statusColor} />

      {/* Plan */}
      <div className="text-gray-600 md:text-sm text-xs">{company.plan}</div>

      {/* Seat */}
      <div className="text-gray-600 md:text-sm text-xs">{company.seat}</div>

      {/* Payment */}
      <Pill label={company.payment} color={paymentColor} />

      {/* Action */}
      <button className="text-primary-purple hover:underline md:text-sm text-xs">
        Deactivate
      </button>
    </div>
  );
};

export default CompanyRow;
