import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number; // number bhi allow h
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value }) => {
  return (
    <div className="bg-primary-blue text-white rounded-2xl sm:p-4 p-3 shadow-md relative">
      <h4 className="sm:text-sm text-xs">{title}</h4>
      <p className="sm:text-3xl text-2xl font-bold mt-2">{value}</p>
    </div>
  );
};

export default DashboardCard;
