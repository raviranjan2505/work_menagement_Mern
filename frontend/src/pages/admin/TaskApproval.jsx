import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../components/DashboardLayout";
import axiosInstance from "../../utils/axioInstance";
import moment from "moment";

const TaskApproval = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [tasks, setTasks] = useState([]);

  // 🟢 Fetch all completed tasks awaiting approval
  const getCompletedTasks = async () => {
    try {
      const res = await axiosInstance.get("/tasks/completed");
      if (res.data?.tasks) setTasks(res.data.tasks);
    } catch (error) {
      console.log("❌ Error fetching completed tasks:", error);
    }
  };

  // ✅ Approve task earning
  const handleApprove = async (taskId) => {
    try {
      await axiosInstance.post(`/tasks/${taskId}/approve-earning`);
      alert("✅ Task earning approved!");
      getCompletedTasks();
    } catch (error) {
      console.error("❌ Error approving task:", error);
      alert("Failed to approve task!");
    }
  };

  // ❌ Reject task (optional)
  const handleReject = async (taskId) => {
    try {
      await axiosInstance.post(`/tasks/${taskId}/reject`);
      alert("❌ Task rejected!");
      getCompletedTasks();
    } catch (error) {
      console.error("❌ Error rejecting task:", error);
      alert("Failed to reject task!");
    }
  };

  useEffect(() => {
    getCompletedTasks();
  }, []);

  return (
    <DashboardLayout activeMenu="TaskApproval">
      <div className="p-6 space-y-6">
        {/* 🟦 Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 shadow-lg text-white">
          <h2 className="text-2xl md:text-3xl font-bold">
            Task Approvals Dashboard
          </h2>
          <p className="text-blue-100 mt-1">
            Welcome, {currentUser?.name || "Admin"} — Review & Approve Completed Tasks
          </p>
        </div>

        {/* 📋 Completed Task Approvals */}
        <div className="bg-white p-6 mt-8 rounded-xl shadow-md overflow-x-auto">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Completed Tasks Pending Approval
          </h4>

          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="text-left px-4 py-2">#</th>
                <th className="text-left px-4 py-2">Task Title</th>
                <th className="text-left px-4 py-2">User</th>
                <th className="text-left px-4 py-2">Amount</th>
                <th className="text-left px-4 py-2">Proof</th>
                <th className="text-left px-4 py-2">Submitted On</th>
                <th className="text-center px-4 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <tr key={task._id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-800">
                      {task.title}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {task.assignedTo?.[0]?.name || "N/A"}
                    </td>
                    <td className="px-4 py-2 font-semibold text-gray-800">
                      ₹{task.amount || 0}
                    </td>
                    <td className="px-4 py-2">
                      {task.userFiles ? (
                        <a
                          href={task.userFiles}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          View Proof
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">No file</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {moment(task.updatedAt).format("DD MMM YYYY")}
                    </td>

                    {/* 🧭 Action Buttons */}
                    <td className="px-4 py-2 text-center">
                      {task.earningStatus !== "Approved" ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleApprove(task._id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(task._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-green-600 font-semibold">Approved</span>
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
                    No completed tasks waiting for approval
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

export default TaskApproval;
