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
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // ✅ Fetch Dashboard Stats
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
        if (res.ok) setDashboardData(data);
      } catch (err) {
        console.error("Network error:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboard();
  }, []);

  // ✅ Fetch recent activity logs
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoadingActivity(true);
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${serverUrl}/all_activity/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await res.json();
        console.log("[Recent Activity API Response]:", data);

        if (res.ok && Array.isArray(data.results)) {
          setActivityLogs(data.results);
        }
      } catch (err) {
        console.error("Network error (activity):", err);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchActivity();
  }, []);

  return (
    <div className="sm:p-8 p-4 flex flex-col gap-8">
      {/* Top Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-500">
          Welcome 👋 <br />
          <span className="text-3xl font-semibold text-primary-blue">
            {loading
              ? "Loading..."
              : user?.company_name
              ? user.company_name
              : user?.name}
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
            loadingStats
              ? "..."
              : `$${dashboardData?.total_points_allocated ?? 0}`
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
          value={
            loadingStats ? "..." : `$${dashboardData?.missed_opportunity ?? 0}`
          }
        />
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6">
        {/* Chart */}
        <div className="col-span-2">
          <ReferralTrendsChart />
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm md:mt-0 mt-6 flex flex-col">
          <h3 className="text-lg font-semibold text-primary-blue mb-6">
            Recent Activity
          </h3>

          <SimpleBar style={{ maxHeight: 450 }} autoHide={true}>
            <div className="space-y-6 pr-1">
              {loadingActivity ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : activityLogs.length === 0 ? (
                <p className="text-sm text-gray-500">No recent activity.</p>
              ) : (
                activityLogs.map((act, idx) => {
                  const dateObj = act.created_at
                    ? new Date(act.created_at)
                    : null;
                  const formattedTime = dateObj
                    ? `${dateObj.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })} ${dateObj.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : "";

                  return (
                    <RecentActivityRow
                      key={idx}
                      text={`${act.title} — ${act.body}`}
                      time={formattedTime}
                    />
                  );
                })
              )}
            </div>
          </SimpleBar>
        </div>
      </div>

      <WithdrawalManagement />
    </div>
  );
};

export default Dashboard;
