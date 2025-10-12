import React from "react";
import ResolutionTimeChart from "../adminComponents/ResolutionTimeChart";
import TicketsPerAgentChart from "../adminComponents/TicketsPerAgentChart";
import CustomerSatisfactionChart from "../adminComponents/CustomerSatisfactionChart";

const metrics = [
  {
    title: "Tickets Resolved",
    value: "125",
    change: "+10%",
    positive: true,
  },
  {
    title: "Avg. Resolution Time",
    value: "2.5 hours",
    change: "-5%",
    positive: false,
  },
  {
    title: "Customer Satisfaction",
    value: "92%",
    change: "+8%",
    positive: true,
  },
  {
    title: "Total Points Allocated",
    value: "$12,500",
    change: "+3%",
    positive: true,
  },
  {
    title: "Open vs. Closed Tickets",
    value: "200 / 1,050",
    change: "-5%",
    positive: false,
  },
];

const AdminPerformance: React.FC = () => {
  return (
    <div className="sm:p-6 p-4 flex flex-col min-h-screen space-y-6">
      {/* Page heading */}
      <div>
        <h2 className="text-2xl font-bold text-primary-blue">Performance Metrics</h2>
        <p className="text-gray-600 text-sm mt-1">
          Analyze support team performance with key metrics and visualizations.
        </p>
      </div>

      {/* Top cards */}
      <div className="grid lg:grid-cols-5 sm:grid-cols-2 grid-cols-1 gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="bg-primary-blue text-white rounded-xl shadow-sm px-5 py-4 flex flex-col justify-between"
          >
            <div className="text-sm opacity-90">{m.title}</div>
            <div className="mt-2 text-2xl font-bold">{m.value}</div>
            <div
              className={`text-xs mt-1 ${
                m.positive ? "text-green-400" : "text-red-400"
              }`}
            >
              {m.change}
            </div>
          </div>
        ))}
      </div>

      {/* 2 graphs side by side */}
      <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
        <ResolutionTimeChart />
        <TicketsPerAgentChart />
      </div>

      {/* Bottom chart full width */}
      <CustomerSatisfactionChart />
    </div>
  );
};

export default AdminPerformance;
