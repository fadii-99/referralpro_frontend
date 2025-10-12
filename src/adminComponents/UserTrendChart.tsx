// src/adminComponents/UserTrendChart.tsx
import React, { useMemo } from "react";
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);

type TrendPoint = { month: string; users: number };

const UserTrendChart: React.FC<{ dataFromApi?: TrendPoint[] }> = ({ dataFromApi }) => {
  const lineColor = "#02025c"; // primary-blue
  const topFill = "rgba(36,212,254,0.45)"; // aqua
  const bottomFill = "rgba(124,90,246,0.06)"; // purple faint

  const labels = useMemo(
    () =>
      Array.isArray(dataFromApi) && dataFromApi.length > 0
        ? dataFromApi.map((p) => p.month)
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    [dataFromApi]
  );

  const values = useMemo(
    () =>
      Array.isArray(dataFromApi) && dataFromApi.length > 0
        ? dataFromApi.map((p) => Number(p.users || 0))
        : [1200, 1400, 1350, 1600, 1800, 1750, 2000],
    [dataFromApi]
  );

  const gradientBg = (context: any) => {
    const { ctx, chartArea } = context.chart;
    if (!chartArea) return topFill;
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, topFill);
    gradient.addColorStop(1, bottomFill);
    return gradient;
  };

  const data = {
    labels,
    datasets: [
      {
        label: "Active Users",
        data: values,
        borderColor: lineColor,
        backgroundColor: gradientBg,
        pointBackgroundColor: "#fff",
        pointBorderColor: lineColor,
        pointBorderWidth: 2,
        pointRadius: 4.5,
        pointHoverRadius: 6,
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
        callbacks: {
          title: () => "",
          label: (ctx: any) => `${ctx.parsed.y} users`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: false, drawBorder: false },
        ticks: { display: false },
      },
      x: {
        grid: { display: false },
        border: { display: true, color: "rgba(36,212,254,0.35)", width: 2 },
        ticks: { color: "#02025c", font: { weight: "700" as const } },
      },
    },
  };

  return (
    <div className="bg-white md:p-6 p-4 rounded-xl shadow-sm">
      <h3 className="sm:text-2xl text-lg font-semibold text-primary-blue mb-6">
        Active Users Trend
      </h3>
      <div className="h-[25rem]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default UserTrendChart;
