import React, { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import RecentActivityRow from "../components/RecentActivityRow";
import ReferralTrendsChart from "../components/ReferralTrendCharts";
import WithdrawalManagement from "../components/WithdrawalManagement";
import SimpleBar from "simplebar-react";
import { useUserContext } from "../context/UserProvider";

const serverUrl = import.meta.env.VITE_SERVER_URL;

const Dashboard: React.FC = () => {
  const { user, loading } = useUserContext();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoadingStats(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${serverUrl}/refer/dashboard/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await res.json();
        // console.log("[Dashboard API Response]:", data);

        if (res.ok) {
          setDashboardData(data);
        } else {
          // console.error("Dashboard API error:", data);
        }
      } catch (err) {
        console.error("Network error:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboard();
  }, []);

  // ✅ Dummy Recent Activities
  const dummyRecent = [
    { text: "New referral created by Sarah", time: "2 hours ago" },
    { text: "Referral accepted by David", time: "3 hours ago" },
    { text: "Referral completed by Emily", time: "5 hours ago" },
    { text: "Points cashed out by John", time: "1 day ago" },
    { text: "New user joined your company", time: "2 days ago" },
  ];

  return (
    <div className="sm:p-8 p-4 flex flex-col gap-8">
      {/* Top Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-500">
          Welcome Back 👋 <br />
          <span className="text-3xl font-semibold text-primary-blue">
           {loading ? "Loading..." : (user?.company_name ? user.company_name : user?.name)}
          </span>
        </h2>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <DashboardCard
          title="Referrals Created"
          value={loadingStats ? "..." : dashboardData?.referrals_created ?? 0}
        />
        <DashboardCard
          title="Referrals Accepted"
          value={loadingStats ? "..." : dashboardData?.referrals_accepted ?? 0}
        />
        <DashboardCard
          title="Referrals Completed"
          value={loadingStats ? "..." : dashboardData?.referrals_completed ?? 0}
        />
        <DashboardCard
          title="Total Points Allocated"
          value={
            loadingStats ? "..." : `$${dashboardData?.total_points_allocated ?? 0}`
          }
        />
        <DashboardCard
          title="Points Cashed Value"
          value={
            loadingStats ? "..." : `$${dashboardData?.points_cashed_value ?? 0}`
          }
        />
        <DashboardCard
          title="Missed Opportunity"
          value={loadingStats ? "..." : `$${dashboardData?.missed_opportunity ?? 0}`}
        />
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6">
        {/* Chart */}
        <div className="col-span-2">
          <ReferralTrendsChart />
        </div>

        {/* Recent Activity (Dummy Data) */}
        <div className="bg-white p-6 rounded-xl shadow-sm md:mt-0 mt-6 flex flex-col">
          <h3 className="text-lg font-semibold text-primary-blue mb-6">
            Recent Activity
          </h3>

          <SimpleBar style={{ maxHeight: 450 }} autoHide={true}>
            <div className="space-y-6 pr-1">
              {dummyRecent.map((act, idx) => (
                <RecentActivityRow key={idx} text={act.text} time={act.time} />
              ))}
            </div>
          </SimpleBar>
        </div>
      </div>

      <WithdrawalManagement />
    </div>
  );
};

export default Dashboard;
