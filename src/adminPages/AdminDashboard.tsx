import React, { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
// import UserTrendChart from "./../adminComponents/UserTrendChart";
// import ReferralBreakdownChart from "./../adminComponents/ReferralBreakdownChart";

const serverUrl = import.meta.env.VITE_SERVER_URL;
const ADMIN_DASHBOARD_PATH = "/super/dashboard/";

type AdminDashboardPayload = {
  success: boolean;
  data?: {
    active_users: number;
    total_referrals: number;
    total_revenue: number;
    total_points: number;
    total_cashout: number;
    active_subscribers: number;
    cancelled_subscriptions: number;

    // user_trend: TrendPoint[];
    // referral_breakdown: ReferralMonth[];
    revenue_trend: Array<{ month: string; revenue: number }>;

    users_by_role: Array<{ role: string; count: number }>;
    referrals_by_status: Array<{ status: string; count: number }>;
    recent_transactions: Array<{
      id: number | string;
      user__email: string;
      amount: number;
      transaction_type: string;
      created_at: string;
      payment_method: string | null;
    }>;

    summary: {
      total_users: number;
      total_companies: number;
      total_employees: number;
      total_solo_users: number;
      completed_referrals: number;
      pending_referrals: number;
    };
  };
  error?: string;
};

const AdminDashboard: React.FC = () => {
  const [adminData, setAdminData] = useState<AdminDashboardPayload | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      setLoadingStats(true);
      setError(null);
      try {
        const token = localStorage.getItem("adminAccessToken");
        const res = await fetch(`${serverUrl}${ADMIN_DASHBOARD_PATH}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data: AdminDashboardPayload = await res.json().catch(() => ({ success: false } as AdminDashboardPayload));
        console.log("[Admin Dashboard API Response]:", data);

        if (!res.ok) {
          const message =
            data?.error ||
            (res.status === 401
              ? "Unauthorized. Please log in again."
              : res.status === 403
              ? "Forbidden. Superadmin access required."
              : `Request failed with status ${res.status}`);
          setError(message);
          setAdminData(data || null);
        } else {
          setAdminData(data);
        }
      } catch (e: any) {
        console.error("Network error (Admin Dashboard):", e);
        setError("Network error while fetching admin dashboard.");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchAdminDashboard();
  }, []);

  const d = adminData?.data;

  return (
    <div className="sm:p-8 p-4 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-medium text-gray-500">
          Admin Dashboard <br />
          <span className="text-3xl font-bold text-primary-blue">
            System Overview
          </span>
        </h2>

        {loadingStats ? (
          <span className="text-xs text-gray-400">Loading…</span>
        ) : error ? (
          <span className="text-xs text-red-500">{error}</span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          title="Active Users"
          value={
            loadingStats ? "..." : typeof d?.active_users === "number" ? d.active_users.toLocaleString() : "—"
          }
        />
        <DashboardCard
          title="Total Referrals"
          value={
            loadingStats ? "..." : typeof d?.total_referrals === "number" ? d.total_referrals.toLocaleString() : "—"
          }
        />
        <DashboardCard
          title="Revenue"
          value={
            loadingStats
              ? "..."
              : typeof d?.total_revenue === "number"
              ? `$${d.total_revenue.toLocaleString()}`
              : "—"
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6 gap-6">
        {/* <UserTrendChart dataFromApi={d?.user_trend} />
        <ReferralBreakdownChart dataFromApi={d?.referral_breakdown} /> */}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="sm:text-xl text-md font-semibold text-primary-blue mb-6">
          System Health
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#f9f9ff] rounded-lg p-5 shadow-sm flex flex-col border">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-600">Total Points</h4>
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            </div>
            <p className="text-2xl font-bold text-[#0b0d3b] mt-2">
              {loadingStats
                ? "..."
                : typeof d?.total_points === "number"
                ? d.total_points.toLocaleString()
                : "—"}
            </p>
          </div>

          <div className="bg-[#f9f9ff] rounded-lg p-5 shadow-sm flex flex-col border">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-600">Total Cash Out</h4>
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            </div>
            <p className="text-2xl font-bold text-[#0b0d3b] mt-2">
              {loadingStats
                ? "..."
                : typeof d?.total_cashout === "number"
                ? `$${d.total_cashout.toLocaleString()}`
                : "—"}
            </p>
          </div>

          <div className="bg-[#f9f9ff] rounded-lg p-5 shadow-sm flex flex-col border">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-600">Total Active Subscription</h4>
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            </div>
            <p className="text-2xl font-bold text-[#0b0d3b] mt-2">
              {loadingStats
                ? "..."
                : typeof d?.active_subscribers === "number"
                ? d.active_subscribers.toLocaleString()
                : "—"}
            </p>
          </div>

          <div className="bg-[#f9f9ff] rounded-lg p-5 shadow-sm flex flex-col border">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-600">Cancelled Subscriptions</h4>
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            </div>
            <p className="text-2xl font-bold text-[#0b0d3b] mt-2">
              {loadingStats
                ? "..."
                : typeof d?.cancelled_subscriptions === "number"
                ? d.cancelled_subscriptions.toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
