import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../components/DashboardLayout";
import axiosInstance from "../../utils/axioInstance";
import moment from "moment";
import RecentTasks from "../../components/RecentTasks";
import CustomPieChart from "../../components/CustomPieChart";
import CustomBarChart from "../../components/CustomBarChart";

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"];

const UserDashboard = () => {
  const { currentUser } = useSelector((state) => state.user);

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  // ✅ Prepare chart data
  const prepareChartData = (stats) => {
    if (!stats) return;

    const taskDistributionData = [
      { status: "Pending", count: stats.pendingTasks || 0 },
      { status: "Completed", count: stats.completedTasks || 0 },
      { status: "Overdue", count: stats.overdueTasks || 0 },
    ];
    setPieChartData(taskDistributionData);

    const summaryData = [
      { priority: "Pending", count: stats.pendingTasks || 0 },
      { priority: "Completed", count: stats.completedTasks || 0 },
      { priority: "Overdue", count: stats.overdueTasks || 0 },
    ];
    setBarChartData(summaryData);
  };

  // ✅ Fetch task dashboard data
  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get("/tasks/user-dashboard-data");
      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data.statistics);
      }
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="p-6 space-y-6">
        {/* ✅ Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 shadow-lg text-white">
          <h2 className="text-2xl md:text-3xl font-bold">
            Welcome, {currentUser?.name || "User"}!
          </h2>
          <p className="text-blue-100 mt-1">
            {moment().format("dddd, Do MMMM YYYY")}
          </p>
        </div>

        {/* ✅ Task Statistics */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Tasks"
              value={dashboardData.statistics?.totalTasks || 0}
              color="border-blue-500"
            />
            <StatCard
              title="Pending Tasks"
              value={dashboardData.statistics?.pendingTasks || 0}
              color="border-yellow-500"
            />
            <StatCard
              title="Completed Tasks"
              value={dashboardData.statistics?.completedTasks || 0}
              color="border-green-500"
            />
            <StatCard
              title="Overdue Tasks"
              value={dashboardData.statistics?.overdueTasks || 0}
              color="border-red-500"
            />
          </div>
        )}

        {/* ✅ Task Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Task Status Overview
            </h3>
            <div className="h-64">
              <CustomPieChart data={pieChartData} colors={COLORS} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Task Priority Levels
            </h3>
            <div className="h-64">
              <CustomBarChart data={barChartData} />
            </div>
          </div>
        </div>

        {/* ✅ Recent Tasks */}
        <div className="bg-white p-6 rounded-xl shadow-md mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Tasks
          </h3>
          {dashboardData?.recentTasks?.length > 0 ? (
            <RecentTasks tasks={dashboardData.recentTasks} />
          ) : (
            <p className="text-gray-500 text-sm">No recent tasks found.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;

// ✅ Reusable Statistic Card
const StatCard = ({ title, value, color }) => (
  <div
    className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${color} transition-all hover:shadow-lg`}
  >
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
  </div>
);
