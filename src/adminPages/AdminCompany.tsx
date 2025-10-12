// src/screens/AdminCompany.tsx
import React, { useEffect, useState } from "react";
import { FiFilter } from "react-icons/fi";
import { useAdminCompanyContext } from "./../adminContext/AdminCompanyProvider";
import SmallLoader from "./../components/SmallLoader";
import Pagination from "./../components/Pagination";
import CompanyRow from "./../adminComponents/CompanyRow";

const AdminCompany: React.FC = () => {
  const { companies, loading, loadCompanies } = useAdminCompanyContext();
  const [page, setPage] = useState(1);

  useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

  const rowsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(companies.length / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const current = companies.slice(start, start + rowsPerPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  return (
    <div className="sm:p-6 p-4 flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between pb-4">
        <h2 className="md:text-2xl text-xl font-semibold text-primary-blue">Company Management</h2>
        <div className="flex flex-row items-center gap-3">
          <button className="h-10 w-10 rounded-xl bg-white border border-black/5 shadow-sm flex items-center justify-center">
            <FiFilter className="text-primary-purple text-lg" />
          </button>
        </div>
      </div>

      {/* Table header */}
      <div className="overflow-x-auto">
        <div
          className="grid grid-cols-[200px_200px_150px_150px_150px_150px_120px] min-w-[1100px]
                     px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600
                     bg-gray-50 rounded-xl"
        >
          <div>Company Name</div>
          <div>Industry</div>
          <div>Status</div>
          <div>Subscription Plan</div>
          <div>Seat Usage</div>
          <div>Payment Status</div>
          <div>Actions</div>
        </div>
      </div>

      {/* Rows */}
      <div className="overflow-x-auto space-y-2 mt-2">
        {loading ? (
          <div className="py-6 flex justify-center">
            <SmallLoader />
          </div>
        ) : current.length === 0 ? (
          <div className="text-sm p-8 text-center text-gray-500">No companies found.</div>
        ) : (
          current.map((c) => <CompanyRow key={c.id} company={c} />)
        )}
      </div>

      {/* Pagination */}
      {current.length > 0 && !loading && (
        <div className="mt-auto pt-6 flex justify-end">
          <Pagination current={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default AdminCompany;
