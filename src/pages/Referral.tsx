// src/screens/Referral.tsx
import React, { useEffect, useState, useMemo } from "react";
import { FiFilter } from "react-icons/fi";
import Pagination from "../components/Pagination";
import ReferralRow from "../components/ReferralRow";
import type { Referral } from "../components/ReferralRow";
import { useReferralContext } from "../context/ReferralProvider";
import SmallLoader from "../components/SmallLoader";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserProvider";

const Referral: React.FC = () => {
  const { referrals, loading, loadReferrals } = useReferralContext();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // 🔹 Read biz_type from context
  const { user } = useUserContext();
  const isSole = useMemo(() => {
    const raw = (user?.biz_type || "").trim().toLowerCase();
    return /^(sole|sole\s*trader|solo|sole_trader)$/i.test(raw);
  }, [user?.biz_type]);

  useEffect(() => {
    void loadReferrals();
  }, [loadReferrals]);

  const rowsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(referrals.length / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const current = referrals.slice(start, start + rowsPerPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const slugify = (str: string) =>
    str
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const handleRowClick = (ref: Referral) => {
    localStorage.setItem("selectedReferralId", ref.reference_id);
    localStorage.setItem("selectedId", ref.id);
    const companySlug = slugify(ref.referred_to_name);
    navigate(`/Dashboard/Referral/${companySlug}`);
  };

  // 🔸 Only on this page: if sole, force Assigned Rep to "self"
  const listForRender: Referral[] = useMemo(() => {
    if (!isSole) return current;
    return current.map((r) => ({
      ...r,
      assigned_to_name: "self",
    }));
  }, [current, isSole]);

  return (
    <div className="sm:p-6 p-4 flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between pb-4">
        <h2 className="md:text-2xl text-xl font-semibold text-primary-blue">
          Company Referrals List
        </h2>
        <div className="flex flex-row items-center gap-3">
          <button className="h-10 w-10 rounded-xl bg-white border border-black/5 shadow-sm flex items-center justify-center">
            <FiFilter className="text-primary-purple text-lg" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="overflow-x-auto">
          <div
            className="grid grid-cols-[160px_200px_1fr_1fr_1fr_1fr_60px] min-w-[900px]
                       px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 
                       bg-gray-50 rounded-xl"
          >
            <div className="text-left">ID</div>
            <div className="text-left">Customer Name</div>
            <div className="text-left">Service Type</div>
            <div className="text-left">Assigned Rep</div>
            <div className="text-left">Status</div>
            <div className="text-left">Priority</div>
            <div className="text-right pr-2">Actions</div>
          </div>
        </div>

        {/* Rows */}
        <div className="overflow-x-auto space-y-2">
          {loading ? (
            <div className="py-6 flex justify-center">
              <SmallLoader />
            </div>
          ) : listForRender.length === 0 ? (
            <div className="text-sm p-8 text-center text-gray-500">
              No referrals found.
            </div>
          ) : (
            listForRender.map((r: Referral) => (
              <ReferralRow
                key={r.id}
                referral={r}
                onClick={() => handleRowClick(r)}
                onView={() => handleRowClick(r)}
              />
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {listForRender.length > 0 && !loading && (
        <div className="mt-auto pt-6 flex justify-end">
          <Pagination
            current={page}
            totalPages={totalPages}
            onChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
};

export default Referral;
