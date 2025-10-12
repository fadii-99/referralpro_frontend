import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, ChartDataLabels);

const ResolutionTimeChart: React.FC = () => {
  const COLORS = ["#02025c", "#7c5af6", "#24d4fe"];

  const DATA = useMemo(() => {
    const labels = ["Week 1", "Week 2", "Week 3"];
    const raw = [65, 20, 15];

    return {
      labels,
      datasets: [
        {
          data: raw,
          backgroundColor: COLORS,
          borderColor: "#FFFFFF",
          borderWidth: 6,
          hoverOffset: 6,
          spacing: 0,
        },
      ],
    };
  }, []);

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        formatter: (value: number) => `${value}%`,
        color: "#fff",
        font: { weight: "700", size: 14 },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-black/5 md:p-5 p-3 h-full flex flex-col">
      <h3 className="sm:text-xl text-md font-semibold text-primary-blue md:mb-4 mb-2">
        Resolution Time
      </h3>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-[20rem]">
          <Pie data={DATA} options={options} />
        </div>
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }} /> Week 1
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }} /> Week 2
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[2] }} /> Week 3
        </span>
      </div>
    </div>
  );
};

export default ResolutionTimeChart;
