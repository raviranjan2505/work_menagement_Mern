import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../components/DashboardLayout";
import axiosInstance from "../../utils/axioInstance";
import moment from "moment";

const ManageFinance = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [financeData, setFinanceData] = useState({});
  const [withdrawRequests, setWithdrawRequests] = useState([]);

  // 💰 Fetch finance data (admin)
  const getFinanceData = async () => {
    try {
      const response = await axiosInstance.get("/finance/admin");
      if (response.data) setFinanceData(response.data);
    } catch (error) {
      console.log("❌ Error fetching finance data:", error);
    }
  };

  const getWithdrawRequests = async () => {
  try {
    const response = await axiosInstance.get("/finance/withdrawals");
    if (response.data && response.data.withdrawals) {
      setWithdrawRequests(response.data.withdrawals);
    }
  } catch (error) {
    console.log("❌ Error fetching withdrawal requests:", error);
  }
};

  // ✅ Approve Withdrawal
  const handleApprove = async (withdrawalId) => {
    try {
      await axiosInstance.post(`/finance/withdraw/${withdrawalId}/approve`);
      alert("✅ Withdrawal approved successfully!");
      getWithdrawRequests();
      getFinanceData();
    } catch (error) {
      console.log("❌ Error approving withdrawal:", error);
      alert("Failed to approve withdrawal!");
    }
  };

  // ❌ Reject Withdrawal
  const handleReject = async (withdrawalId) => {
    try {
      await axiosInstance.post(`/finance/withdraw/${withdrawalId}/reject`);
      alert("❌ Withdrawal rejected!");
      getWithdrawRequests();
      getFinanceData();
    } catch (error) {
      console.log("❌ Error rejecting withdrawal:", error);
      alert("Failed to reject withdrawal!");
    }
  };

  useEffect(() => {
    getFinanceData();
    getWithdrawRequests();
  }, []);

  const users = financeData?.users || [];

  return (
    <DashboardLayout activeMenu="Finance">
      <div className="p-6 space-y-6">
        {/* 🟦 Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Welcome, {currentUser?.name || "Admin"}!
              </h2>
              <p className="text-blue-100 mt-1">
                {moment().format("dddd, Do MMMM YYYY")}
              </p>
            </div>
          </div>
        </div>

        {/* 💰 Finance Overview */}
        {financeData && (
          <>
            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              Finance Overview
            </h3>

            {/* 💹 Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Earnings"
                value={`₹${financeData.totalEarnings || 0}`}
                color="border-green-500"
              />
              <StatCard
                title="Total Withdrawals"
                value={`₹${financeData.totalWithdrawals || 0}`}
                color="border-red-500"
              />
              <StatCard
                title="Total Users"
                value={users.length || 0}
                color="border-blue-500"
              />
            </div>

            {/* 🧾 User Wallet Table */}
            <div className="bg-white p-6 mt-6 rounded-xl shadow-md overflow-x-auto">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                User Wallet Details
              </h4>
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-2">Name</th>
                    <th className="text-left px-4 py-2">Email</th>
                    <th className="text-left px-4 py-2">Wallet Balance (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr
                        key={user._id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-2">{user.name}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2 font-semibold text-gray-700">
                          ₹{user.wallet || 0}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center text-gray-500 py-4 italic"
                      >
                        No user data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 🏦 Withdrawal Requests */}
        <div className="bg-white p-6 mt-8 rounded-xl shadow-md overflow-x-auto">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Withdrawal Requests
          </h4>

          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="text-left px-4 py-2">#</th>
                <th className="text-left px-4 py-2">User</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Amount (₹)</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Requested On</th>
                <th className="text-center px-4 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {withdrawRequests.length > 0 ? (
                withdrawRequests.map((req, index) => (
                  <tr key={req._id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-800">
                      {req.user?.name || "N/A"}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{req.user?.email || "N/A"}</td>
                    <td className="px-4 py-2 font-semibold text-gray-800">
                      ₹{req.amount}
                    </td>

                    {/* 🟢 Status Badge */}
                    <td className="px-4 py-2">
                      {req.status === "Approved" && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          Approved
                        </span>
                      )}
                      {req.status === "Rejected" && (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                          Rejected
                        </span>
                      )}
                      {req.status === "Pending" && (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-2 text-gray-600">
                      {moment(req.createdAt).format("DD MMM YYYY")}
                    </td>

                    {/* 🧭 Action Buttons */}
                    <td className="px-4 py-2 text-center">
                      {req.status === "Pending" ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleApprove(req._id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center text-gray-500 py-4 italic"
                  >
                    No withdrawal requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageFinance;

// ✅ Reusable Stat Card Component
const StatCard = ({ title, value, color }) => (
  <div
    className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${color} transition-all hover:shadow-lg`}
  >
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
  </div>
);
