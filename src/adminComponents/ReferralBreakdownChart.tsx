// src/adminComponents/ReferralBreakdownChart.tsx
import React, { useMemo } from "react";
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

type ReferralMonth = {
  month: string;
  pending: number;
  friend_opted_in: number;
  business_accepted: number;
  in_progress: number;
  completed: number;
  cancelled: number;
};

const altColors = ["#02025c", "#7c5af6"]; // primary-blue / purple

const ReferralBreakdownChart: React.FC<{ dataFromApi?: ReferralMonth[] }> = ({ dataFromApi }) => {
  const { labels, values } = useMemo(() => {
    if (Array.isArray(dataFromApi) && dataFromApi.length > 0) {
      const lbls = dataFromApi.map((m) => m.month);
      const vals = dataFromApi.map(
        (m) =>
          (m.pending || 0) +
          (m.friend_opted_in || 0) +
          (m.business_accepted || 0) +
          (m.in_progress || 0) +
          (m.completed || 0) +
          (m.cancelled || 0)
      );
      return { labels: lbls, values: vals };
    }
    // fallback (old dummy)
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      values: [150, 200, 250, 220, 300, 270, 310],
    };
  }, [dataFromApi]);

  const backgroundColor = useMemo(
    () => labels.map((_, i) => altColors[i % altColors.length]),
    [labels]
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Referrals",
        data: values,
        backgroundColor,
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
          label: (ctx: any) => `${ctx.parsed.y} referrals`,
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
        ticks: { color: "#02025c", font: { weight: "600" as const } },
      },
    },
  };

  return (
    <div className="bg-white md:p-6 p-4 rounded-xl shadow-sm">
      <h3 className="sm:text-2xl text-lg font-semibold text-primary-blue mb-6">
        Referral Breakdown
      </h3>
      <div className="h-[25rem]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default ReferralBreakdownChart;

