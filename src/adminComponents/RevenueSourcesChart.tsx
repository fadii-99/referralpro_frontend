import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const RevenueSourcesChart: React.FC = () => {
  const data = {
    labels: ["Subscriptions", "Referral Fees", "Processing Fees", "SMS Surcharges"],
    datasets: [
      {
        label: "Revenue",
        data: [300, 400, 350, 320],
        backgroundColor: ["#02025c", "#7c5af6", "#02025c", "#7c5af6"],
        borderRadius: 12,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#7c5af6", // purple
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: { label: (ctx: any) => `$${ctx.parsed.y}` },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { display: false }, ticks: { display: false } },
      x: {
        grid: { display: false },
        border: { display: true, color: "rgba(36,212,254,0.35)", width: 2 },
        ticks: { color: "#02025c", font: { weight: "600" as const } },
      },
    },
  };

  return (
    <div className="bg-white md:p-6 p-4 rounded-xl shadow-sm">
      <h3 className="sm:text-xl text-md font-semibold text-primary-blue mb-2">Revenue Sources</h3>
      <div className="mb-12">
        <span className="font-bold sm:text-4xl text-2xl text-primary-blue">$125,000</span>
        <p className="sm:text-sm text-[10px] text-primary-blue">
          This Month <span className="text-green-500">+15%</span>
        </p>
      </div>
      <div className="h-[25rem]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default RevenueSourcesChart;
