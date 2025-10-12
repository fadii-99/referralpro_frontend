import React, { useEffect, useMemo, useState } from "react";
import { useAdminUserContext } from "./../adminContext/AdminUserProvider"; // adjust path if needed
import SmallLoader from "../components/SmallLoader";
import Pagination from "../components/Pagination";
import UserRow from "../adminComponents/UserRow";

const AdminUsers: React.FC = () => {
  const { loading, error, data, loadUsers } = useAdminUserContext();
  const [list, setList] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const rawUsers: any[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data?.users)) return data.users;
    if (Array.isArray(data?.data?.users)) return data.data.users;
    return [];
  }, [data]);

  useEffect(() => {
    setList(rawUsers);
  }, [rawUsers]);

  const rowsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(list.length / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const current = list.slice(start, start + rowsPerPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  // local-only delete (no API)
  const onDelete = (id: number | string) => {
    if (id === undefined || id === null) return;
    const ok = window.confirm("Delete this user locally (no API)?");
    if (!ok) return;
    setList(prev => prev.filter(u => u.id !== id));
    console.log("[AdminUsers] local delete id:", id);
  };

  return (
    <div className="sm:p-6 p-4 flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between pb-4">
        <h2 className="md:text-2xl text-xl font-semibold text-primary-blue">User Management</h2>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Header row (grid) */}
      <div className="bg-gray-50 rounded-xl border border-black/5 overflow-x-auto">
        <div
          className="grid min-w-[1100px]
                     grid-cols-[1.2fr_1.4fr_1.2fr_0.9fr_1.1fr_1fr_0.8fr_auto]
                     px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600"
        >
          <div>Name</div>
          <div>Email</div>
          <div>Company</div>
          <div>Status</div>
          <div>Verification</div>
          <div>Phone</div>
          <div>Role</div>
          <div className="text-right">Action</div>
        </div>
      </div>

      {/* Rows */}
      <div className="overflow-x-auto space-y-2 mt-2">
        {loading ? (
          <div className="py-6 flex justify-center">
            <SmallLoader />
          </div>
        ) : current.length === 0 ? (
          <div className="text-sm p-8 text-center text-gray-500 bg-white rounded-xl border border-black/5">
            No users found.
          </div>
        ) : (
          current.map((u: any) => (
            <UserRow key={u.id} user={u} onDelete={onDelete} />
          ))
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

export default AdminUsers;
