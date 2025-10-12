import React from "react";
import { FiEye } from "react-icons/fi";

export type Review = {
  id: string;
  company: string;
  logo?: string;
  referRating: number;
  googleRating: number;
};

const ReviewRow: React.FC<{ review: Review; onView?: () => void }> = ({ review, onView }) => {
  return (
    <div
      className="grid grid-cols-[2fr_1fr_1fr_100px] min-w-[900px]
                 items-center bg-white rounded-2xl px-6 py-3 border border-black/5 
                 shadow-sm hover:shadow-md transition"
    >
      {/* Company */}
      <div className="flex items-center gap-3 font-medium text-gray-700 md:text-sm text-xs">
        {review.logo ? (
          <img src={review.logo} alt={review.company} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-blue text-white flex items-center justify-center text-xs">
            {review.company.charAt(0).toUpperCase()}
          </div>
        )}
        <span>{review.company}</span>
      </div>

      {/* Refer Rating */}
      <div className="flex items-center gap-1 text-amber-500 font-semibold md:text-sm text-xs">
        ⭐ {review.referRating.toFixed(1)}
      </div>

      {/* Google Rating */}
      <div className="flex items-center gap-2 text-emerald-600 font-semibold md:text-sm text-xs">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          alt="Google"
          className="w-4 h-4"
        />
        {review.googleRating.toFixed(1)} Rating
      </div>

      {/* Action */}
      <div className="flex justify-end pr-2">
        <button
          type="button"
          aria-label="View"
          className="text-primary-purple hover:opacity-80"
          onClick={onView}
        >
          <FiEye className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default ReviewRow;
