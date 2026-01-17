import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../components/DashboardLayout";
import axiosInstance from "../../utils/axioInstance";
import moment from "moment";

const ClientDashboard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [dashboardData, setDashboardData] = useState(null);

  const getDashboardData = async () => {
    try {
      const res = await axiosInstance.get("/client/dashboard");
      setDashboardData(res.data);
    } catch (error) {
      console.error("❌ Error fetching client dashboard:", error);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="p-6 space-y-6">

        {/* ✅ Welcome Section */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 shadow-lg text-white">
          <h2 className="text-2xl md:text-3xl font-bold">
            Welcome, {currentUser?.name || "Client"}!
          </h2>
          <p className="text-green-100 mt-1">
            {moment().format("dddd, Do MMMM YYYY")}
          </p>
        </div>

        {/* ✅ Client Stats */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Clients"
              value={dashboardData.stats.totalClients}
              color="border-green-500"
            />
            <StatCard
              title="Individuals"
              value={dashboardData.stats.individual}
              color="border-blue-500"
            />
            <StatCard
              title="Firms"
              value={dashboardData.stats.firm}
              color="border-yellow-500"
            />
            <StatCard
              title="Companies"
              value={dashboardData.stats.company}
              color="border-purple-500"
            />
          </div>
        )}

        {/* ✅ Recent Clients */}
        <div className="bg-white p-6 rounded-xl shadow-md mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Clients
          </h3>

          {dashboardData?.recentClients?.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2">Client Name</th>
                  <th>Type</th>
                  <th>PAN</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentClients.map((client) => (
                  <tr key={client._id} className="border-t">
                    <td className="py-2 font-medium">
                      {client.clientName}
                    </td>
                    <td>{client.businessType}</td>
                    <td>{client.pan}</td>
                    <td>{moment(client.createdAt).fromNow()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-sm">No clients found.</p>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
const StatCard = ({ title, value, color }) => (
  <div className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${color}`}>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
  </div>
);
