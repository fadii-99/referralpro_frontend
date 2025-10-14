import React from "react";
import { FaUserCircle } from "react-icons/fa";

interface RecentActivityRowProps {
  text: string;
  time: string;
}

const RecentActivityRow: React.FC<RecentActivityRowProps> = ({ text, time }) => {
  return (
    <div className="flex items-start gap-3 min-h-[44px]">
      {/* Fixed-size icon */}
      <div className="flex-shrink-0">
        <FaUserCircle className="text-primary-purple h-8 w-8 mt-1" />
      </div>

      {/* Text */}
      <div className="flex flex-col items-start gap-1 leading-tight">
        <p className="text-sm text-gray-700 break-words">{text}</p>
        <span className="text-[10px] text-gray-400">{time}</span>
      </div>
    </div>
  );
};

export default RecentActivityRow;
