import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend
);

const CustomerSatisfactionChart: React.FC = () => {
  const lineColor = "#02025c";
  const topFill = "rgba(36, 212, 254, 0.45)";
  const bottomFill = "rgba(124, 90, 246, 0.06)";

  const gradientBg = (context: any) => {
    const { ctx, chartArea } = context.chart;
    if (!chartArea) return topFill;
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, topFill);
    gradient.addColorStop(1, bottomFill);
    return gradient;
  };

  const data = {
    labels: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Customer Satisfaction",
        data: [90, 92, 88, 93, 95, 91, 92],
        borderColor: lineColor,
        backgroundColor: gradientBg,
        pointBackgroundColor: "#fff",
        pointBorderColor: lineColor,
        pointBorderWidth: 2,
        pointRadius: 4.5,
        fill: true,
        tension: 0.45,
        borderWidth: 3,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        intersect: false,
        displayColors: false,
        padding: 10,
        backgroundColor: "#7c5af6",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: { label: (ctx: any) => `${ctx.parsed.y}%` },
      },
    },
    scales: {
      y: { beginAtZero: false, grid: { display: false }, ticks: { display: false } },
      x: {
        grid: { display: false },
        border: { display: true, color: "rgba(36,212,254,0.35)", width: 2 },
        ticks: { color: "#02025c", font: { weight: "700" } },
      },
    },
  };

  return (
    <div className="bg-white md:p-6 p-4 rounded-xl shadow-sm">
      <h3 className="sm:text-xl text-md font-semibold text-primary-blue md:mb-4 mb-2">
        Customer Satisfaction
      </h3>
      <div className="mb-4">
        <span className="font-bold sm:text-4xl text-2xl text-primary-blue">92%</span>
        <p className="sm:text-sm text-[10px] text-primary-blue">
          Last 30 Days <span className="text-green-500">+2%</span>
        </p>
      </div>
      <div className="h-[25rem]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default CustomerSatisfactionChart;
