import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { MdDelete } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SelectedUsers from "../../components/SelectedUsers";
import TodoListInput from "../../components/TodoListInput";
import AddAttachmentsInput from "../../components/AddAttachmentsInput";
import axiosInstance from "../../utils/axioInstance";
import moment from "moment";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";
import DeleteAlert from "../../components/DeleteAlert";

const CreateTask = () => {
  const location = useLocation();
  const { taskId } = location.state || {};
  const navigate = useNavigate();

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: null,
    assignedTo: [],
    todoChecklist: [],
    attachments: [],
    amount: 0,
  });

  const [currentTask, setCurrentTask] = useState(null);
  const [error, setError] = useState("");
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const handleValueChange = (key, value) => {
    setTaskData((prev) => ({ ...prev, [key]: value }));
  };

  const clearData = () => {
    setTaskData({
      title: "",
      description: "",
      priority: "Low",
      dueDate: null,
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
      amount: 0,
    });
  };

  // ✅ Create Task
  const createTask = async () => {
    try {
      const todolist = taskData.todoChecklist.map((item) => ({
        task: item,
        completed: false,
      }));

      const formData = new FormData();
      formData.append("title", taskData.title);
      formData.append("description", taskData.description);
      formData.append("priority", taskData.priority);
      formData.append("dueDate", moment(taskData.dueDate).format("YYYY-MM-DD"));
      formData.append("amount", taskData.amount);
      formData.append("assignedTo", JSON.stringify(taskData.assignedTo));
      formData.append("todoChecklist", JSON.stringify(todolist));

      // ✅ Add files
      if (Array.isArray(taskData.attachments)) {
        taskData.attachments.forEach((file) => {
          if (file instanceof File) {
            formData.append("attachments", file);
          }
        });
      }

      // 🧠 Debug log
      console.log("🚀 Uploading files:", taskData.attachments);

      const response = await axiosInstance.post("/tasks/create", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("✅ Task created:", response.data);
      toast.success("Task created successfully!");
      clearData();
    } catch (error) {
      console.error("❌ Error creating task:", error);
      toast.error("Error creating task!");
    }
  };

  // ✅ Update Task
  const updateTask = async () => {
    try {
      const todolist = taskData.todoChecklist.map((item) => {
        const prevTodos = currentTask?.todoChecklist || [];
        const matched = prevTodos.find((t) => t.task === item);
        return {
          task: item,
          completed: matched ? matched.completed : false,
        };
      });

      const formData = new FormData();
      formData.append("title", taskData.title);
      formData.append("description", taskData.description);
      formData.append("priority", taskData.priority);
      formData.append("dueDate", moment(taskData.dueDate).format("YYYY-MM-DD"));
      formData.append("amount", taskData.amount);
      formData.append("assignedTo", JSON.stringify(taskData.assignedTo));
      formData.append("todoChecklist", JSON.stringify(todolist));

      if (Array.isArray(taskData.attachments)) {
        taskData.attachments.forEach((file) => {
          if (file instanceof File) {
            formData.append("attachments", file);
          }
        });
      }

      const res = await axiosInstance.put(`/tasks/${taskId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("❌ Error updating task:", error);
      toast.error("Error updating task!");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!taskData.title.trim()) return setError("Title is required!");
    if (!taskData.description.trim()) return setError("Description is required!");
    if (!taskData.dueDate) return setError("Due date is required!");
    if (taskData.assignedTo.length === 0)
      return setError("Assign task to at least one member!");
    if (taskData.todoChecklist.length === 0)
      return setError("Add at least one todo item!");
    if (!taskData.amount || taskData.amount <= 0)
      return setError("Amount must be greater than 0!");

    if (taskId) updateTask();
    else createTask();
  };

  const getTaskDetailsById = async () => {
    try {
      const res = await axiosInstance.get(`/tasks/${taskId}`);
      const task = res.data;

      if (task) {
        setCurrentTask(task);
        setTaskData({
          title: task.title || "",
          description: task.description || "",
          priority: task.priority || "Low",
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          assignedTo: task.assignedTo?.map((u) => u._id) || [],
          todoChecklist: task.todoChecklist?.map((t) => t.task) || [],
          attachments: task.attachments || [],
          amount: task.amount || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
    }
  };

  const deleteTask = async () => {
    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      toast.success("Task deleted successfully!");
      setOpenDeleteAlert(false);
      navigate("/admin/tasks");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Error deleting task!");
    }
  };

  useEffect(() => {
    if (taskId) getTaskDetailsById();
  }, [taskId]);

  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {taskId ? "Update Task" : "Create New Task"}
            </h2>

            {taskId && (
              <button
                onClick={() => setOpenDeleteAlert(true)}
                className="flex items-center gap-2 text-red-600 hover:text-red-800"
              >
                <MdDelete /> Delete Task
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter title"
                  value={taskData.title}
                  onChange={(e) => handleValueChange("title", e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description"
                  value={taskData.description}
                  onChange={(e) =>
                    handleValueChange("description", e.target.value)
                  }
                />
              </div>

              {/* Priority + Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    value={taskData.priority}
                    onChange={(e) =>
                      handleValueChange("priority", e.target.value)
                    }
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                    value={taskData.amount}
                    onChange={(e) =>
                      handleValueChange("amount", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <DatePicker
                  selected={taskData.dueDate}
                  onChange={(d) => handleValueChange("dueDate", d)}
                  minDate={new Date()}
                  placeholderText="Select due date"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Assigned Users */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign To
                </label>
                <SelectedUsers
                  selectedUser={taskData.assignedTo}
                  setSelectedUser={(v) => handleValueChange("assignedTo", v)}
                />
              </div>

              {/* Todo Checklist */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TODO Checklist
                </label>
                <TodoListInput
                  todoList={taskData.todoChecklist}
                  setTodoList={(v) => handleValueChange("todoChecklist", v)}
                />
              </div>

              {/* Attachments */}
              <AddAttachmentsInput
                attachments={taskData.attachments}
                setAttachments={(v) => handleValueChange("attachments", v)}
              />

              {/* Submit */}
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  {taskId ? "UPDATE TASK" : "CREATE TASK"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={openDeleteAlert}
        onClose={() => setOpenDeleteAlert(false)}
        title="Delete Task"
      >
        <DeleteAlert
          content="Are you sure you want to delete this task?"
          onDelete={deleteTask}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default CreateTask;
