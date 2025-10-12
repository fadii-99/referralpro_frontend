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

const TicketsPerAgentChart: React.FC = () => {
  const data = {
    labels: ["Agent A", "Agent B", "Agent C", "Agent D"],
    datasets: [
      {
        label: "Tickets Resolved",
        data: [1200, 1100, 1150, 1250],
        backgroundColor: "#24d4fe",
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
        backgroundColor: "#7c5af6",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: (ctx: any) => `${ctx.parsed.y} tickets`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: { color: "#02025c", font: { weight: "600" } },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#02025c", font: { weight: "600" } },
      },
    },
  };

  return (
    <div className="bg-white md:p-6 p-4 rounded-xl shadow-sm">
      <h3 className="sm:text-xl text-md font-semibold text-primary-blue mb-2">
        Tickets Per Agent
      </h3>
      <div className="mb-6">
        <span className="font-bold sm:text-4xl text-2xl text-primary-blue">1,250</span>
        <p className="sm:text-sm text-[10px] text-primary-blue">
          Last 30 Days <span className="text-green-500">+15%</span>
        </p>
      </div>
      <div className="h-[20rem]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default TicketsPerAgentChart;
