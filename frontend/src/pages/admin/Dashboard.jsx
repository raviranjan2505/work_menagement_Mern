import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../components/DashboardLayout";
import axiosInstance from "../../utils/axioInstance";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import RecentTasks from "../../components/RecentTasks";
import CustomPieChart from "../../components/CustomPieChart";
import CustomBarChart from "../../components/CustomBarChart";

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [dashboardData, setDashboardData] = useState({});
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  // 📊 Prepare chart data for tasks
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

  // 📥 Fetch admin dashboard data
  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get("/tasks/dashboard-data");
      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data.statistics);
      }
    } catch (error) {
      console.log("❌ Error fetching admin dashboard data:", error);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const stats = dashboardData?.statistics || {};

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="p-6 space-y-6">
        {/* 🟦 Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Welcome! {currentUser?.name}
              </h2>
              <p className="text-blue-100 mt-1">
                {moment().format("dddd, Do MMMM YYYY")}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md"
                onClick={() => navigate("/admin/create-task")}
              >
                + Create New Task
              </button>
            </div>
          </div>
        </div>

        {/* 📊 Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks || 0}
            color="border-blue-500"
          />
          <StatCard
            title="Pending Tasks"
            value={stats.pendingTasks || 0}
            color="border-yellow-500"
          />
          <StatCard
            title="Completed"
            value={stats.completedTasks || 0}
            color="border-green-500"
          />
          <StatCard
            title="Overdue"
            value={stats.overdueTasks || 0}
            color="border-red-500"
          />
        </div>

        {/* 📈 Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Task Distribution
            </h3>
            <div className="h-64">
              <CustomPieChart data={pieChartData} colors={COLORS} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Summary Overview
            </h3>
            <div className="h-64">
              <CustomBarChart data={barChartData} />
            </div>
          </div>
        </div>

        {/* 🕓 Recent Tasks */}
        <RecentTasks tasks={dashboardData?.recentTasks || []} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

// ✅ Reusable StatCard component
const StatCard = ({ title, value, color }) => (
  <div
    className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${color} transition-all hover:shadow-lg`}
  >
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
  </div>
);
