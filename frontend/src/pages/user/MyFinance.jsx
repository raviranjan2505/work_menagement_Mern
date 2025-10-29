import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../components/DashboardLayout";
import axiosInstance from "../../utils/axioInstance";
import moment from "moment";
import { toast } from "react-toastify";

const MyFinance = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [financeData, setFinanceData] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch finance data
  const getFinanceData = async () => {
    try {
      const response = await axiosInstance.get("/finance/user");
      if (response.data) {
        setFinanceData(response.data);
      }
    } catch (error) {
      console.error("❌ Error fetching finance data:", error);
      toast.error("Failed to load finance details.");
    }
  };

  // ✅ Handle Withdraw Request
  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.warn("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/finance/withdraw", { amount: Number(withdrawAmount) });
      toast.success("Withdraw request submitted successfully!");
      setWithdrawAmount("");
      getFinanceData(); // Refresh finance data
    } catch (error) {
      console.error("❌ Withdraw error:", error);
      toast.error(error.response?.data?.message || "Failed to submit withdraw request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFinanceData();
  }, []);

  return (
    <DashboardLayout activeMenu="Finance">
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 shadow-lg text-white">
          <h2 className="text-2xl md:text-3xl font-bold">
            Welcome, {currentUser?.name || "User"}!
          </h2>
          <p className="text-blue-100 mt-1">
            {moment().format("dddd, Do MMMM YYYY")}
          </p>
        </div>

        {/* ✅ Withdraw Request Form */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Withdraw Request</h3>
          <form onSubmit={handleWithdraw} className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="number"
              placeholder="Enter amount"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition disabled:opacity-60"
            >
              {loading ? "Processing..." : "Request Withdraw"}
            </button>
          </form>
        </div>

        {/* Finance Overview */}
        {financeData && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Finance Overview</h3>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Wallet Balance"
                value={`₹${financeData.wallet || 0}`}
                color="border-green-500"
              />
              <StatCard
                title="Total Earnings"
                value={`₹${
                  financeData.transactions?.reduce(
                    (acc, t) => (t.type === "credit" ? acc + t.amount : acc),
                    0
                  ) || 0
                }`}
                color="border-blue-500"
              />
              <StatCard
                title="Total Withdrawals"
                value={`₹${
                  financeData.withdrawals?.reduce(
                    (acc, w) => acc + w.amount,
                    0
                  ) || 0
                }`}
                color="border-red-500"
              />
            </div>

            {/* Transactions Table */}
            <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Transactions
              </h4>
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-2">Type</th>
                    <th className="text-left px-4 py-2">Amount (₹)</th>
                    <th className="text-left px-4 py-2">Description</th>
                    <th className="text-left px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {financeData.transactions?.length > 0 ? (
                    financeData.transactions.map((txn) => (
                      <tr
                        key={txn._id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-2 capitalize">{txn.type}</td>
                        <td className="px-4 py-2 font-semibold">₹{txn.amount}</td>
                        <td className="px-4 py-2">{txn.description || "-"}</td>
                        <td className="px-4 py-2">
                          {moment(txn.createdAt).format("Do MMM YYYY, h:mm A")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center text-gray-500 py-4 italic"
                      >
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Withdrawals Table */}
            <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Withdrawals
              </h4>
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-2">Amount (₹)</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {financeData.withdrawals?.length > 0 ? (
                    financeData.withdrawals.map((wd) => (
                      <tr
                        key={wd._id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-2 font-semibold">
                          ₹{wd.amount}
                        </td>
                        <td
                          className={`px-4 py-2 font-medium ${
                            wd.status === "Approved"
                              ? "text-green-600"
                              : wd.status === "Pending"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {wd.status}
                        </td>
                        <td className="px-4 py-2">
                          {moment(wd.createdAt).format("Do MMM YYYY, h:mm A")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center text-gray-500 py-4 italic"
                      >
                        No withdrawals found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyFinance;

// ✅ Reusable Stat Card Component
const StatCard = ({ title, value, color }) => (
  <div
    className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${color} transition-all hover:shadow-lg`}
  >
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
  </div>
);
