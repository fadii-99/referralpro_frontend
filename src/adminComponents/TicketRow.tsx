// src/adminComponents/TicketRow.tsx
import React from "react";
import type { Ticket } from "../adminContext/AdminTicketProvider";

const Pill: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span
    className={`inline-flex items-center w-fit px-3 py-1 rounded-lg text-nowrap text-xs sm:text-sm font-medium capitalize ${color}`}
  >
    {label}
  </span>
);

const TicketRow: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const statusColor =
    ticket.status === "Open"
      ? "text-rose-700 bg-rose-50"
      : ticket.status === "Resolve"
      ? "text-emerald-700 bg-emerald-50"
      : "text-amber-700 bg-amber-50";

  return (
    <div
      className="grid grid-cols-[120px_200px_200px_150px_200px_150px_1fr] min-w-[1100px]
                 items-center bg-white rounded-2xl px-6 py-3 border border-black/5 
                 shadow-sm hover:shadow-md transition"
    >
      {/* Ticket ID */}
      <div className="font-medium text-gray-700 md:text-sm text-xs">
        {ticket.id}
      </div>

      {/* User */}
      <div className="flex items-center gap-3 font-medium text-gray-700 md:text-sm text-xs">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            ticket.user
          )}&background=0b0d3b&color=fff`}
          alt={ticket.user}
          className="w-8 h-8 rounded-full"
        />
        <span>{ticket.user}</span>
      </div>

      {/* Company with Logo */}
      <div className="flex items-center gap-2">
        <img
          src={ticket.companyLogo}
          alt={ticket.company}
          className="w-8 h-8 rounded-full"
        />
        <span className="text-gray-700 font-medium md:text-sm text-xs">
          {ticket.company}
        </span>
      </div>

      {/* Date */}
      <div className="text-gray-600 md:text-sm text-xs">{ticket.date}</div>

      {/* Agent */}
      <div className="text-gray-700 md:text-sm text-xs">{ticket.agent}</div>

      {/* Status */}
      <Pill label={ticket.status} color={statusColor} />

      {/* Summary */}
      <div className="text-gray-600 md:text-sm text-xs">{ticket.summary}</div>
    </div>
  );
};

export default TicketRow;
