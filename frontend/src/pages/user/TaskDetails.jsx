import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axiosInstance from "../../utils/axioInstance"
import DashboardLayout from "../../components/DashboardLayout"
import moment from "moment"
import AvatarGroup from "../../components/AvatarGroup"
import { FaExternalLinkAlt } from "react-icons/fa"

const TaskDetails = () => {
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)

  // Status badge color
  const getStatusTagColor = (status) => {
    switch (status) {
      case "In Progress":
        return "text-cyan-500 bg-cyan-50 border border-cyan-500/10"
      case "Completed":
        return "text-lime-500 bg-lime-50 border border-lime-500/10"
      default:
        return "text-violet-500 bg-violet-50 border border-violet-500/10"
    }
  }

  // Fetch task details by ID
  const getTaskDetailsById = async () => {
    try {
      const response = await axiosInstance.get(`/tasks/${id}`)
      if (response.data) setTask(response.data)
    } catch (error) {
      console.log("❌ Error fetching task details:", error)
    }
  }

  // Update checklist
  const updateTodoChecklist = async (index) => {
    const updatedChecklist = [...task.todoChecklist]
    updatedChecklist[index].completed = !updatedChecklist[index].completed

    try {
      const response = await axiosInstance.put(`/tasks/${id}/todo`, {
        todoChecklist: updatedChecklist,
      })
      if (response.status === 200) setTask(response.data.task || task)
    } catch (error) {
      console.log("❌ Error updating checklist:", error)
    }
  }

  // Update task status
  const updateStatus = async (status) => {
    try {
      const response = await axiosInstance.put(`/tasks/${id}/status`, {
        status,
      })
      if (response.status === 200) setTask(response.data.task || task)
    } catch (error) {
      console.log("❌ Error updating status:", error)
    }
  }

  // Handle file upload for proof
  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const submitProof = async () => {
    if (!file) return alert("Please select a file to upload!")

    const formData = new FormData()
    formData.append("file", file)

    try {
      setUploading(true)
      const response = await axiosInstance.post(`/tasks/${id}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (response.status === 200) {
        alert("✅ Proof uploaded successfully!")
        getTaskDetailsById()
      }
    } catch (error) {
      console.log("❌ Error submitting proof:", error)
      alert("Failed to upload proof")
    } finally {
      setUploading(false)
      setFile(null)
    }
  }

  const handleLinkClick = (link) => {
    if (!/^https?:\/\//i.test(link)) link = "https://" + link
    window.open(link, "_blank")
  }

  useEffect(() => {
    if (id) getTaskDetailsById()
  }, [id])

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="mt-5 px-4 sm:px-6 lg:px-8">
        {task ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
            <div className="md:col-span-3 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                <div className="flex flex-col space-y-3">
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                    {task.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusTagColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                      <span className="ml-1.5 w-2 h-2 rounded-full bg-current opacity-80"></span>
                    </div>

                    <select
                      onChange={(e) => updateStatus(e.target.value)}
                      value={task.status}
                      className="border border-gray-200 text-sm px-2 py-1 rounded-md outline-none focus:ring-2 focus:ring-violet-400"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <InfoBox label="Description" value={task.description} />
                </div>

                <div className="grid grid-cols-12 gap-4 mt-4">
                  <div className="col-span-6 md:col-span-4">
                    <InfoBox label="Priority" value={task.priority} />
                  </div>

                  <div className="col-span-6 md:col-span-4">
                    <InfoBox
                      label="Due Date"
                      value={
                        task.dueDate
                          ? moment(task.dueDate).format("Do MMM YYYY")
                          : "N/A"
                      }
                    />
                  </div>

                  <div className="col-span-6 md:col-span-4">
                    <label className="text-xs font-medium text-slate-500">
                      Assigned To
                    </label>
                    <AvatarGroup
                      avatars={
                        task.assignedTo?.map((user) => user?.profileImageUrl) ||
                        []
                      }
                      maxVisible={5}
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <label className="text-xs font-medium text-slate-500">
                    Todo Checklist
                  </label>
                  {task.todoChecklist?.map((item, index) => (
                    <TodoCheckList
                      key={index}
                      text={item.task}
                      isChecked={item.completed}
                      onChange={() => updateTodoChecklist(index)}
                    />
                  ))}
                </div>

                {task.attachments?.length > 0 && (
                  <div className="mt-2">
                    <label className="text-xs font-medium text-slate-500">
                      Attachments
                    </label>
                    {task.attachments.map((link, index) => (
                      <Attachment
                        key={index}
                        link={link}
                        index={index}
                        onClick={() => handleLinkClick(link)}
                      />
                    ))}
                  </div>
                )}

                <div className="mt-5">
                  <label className="text-xs font-medium text-slate-500 mb-2 block">
                    Submit Proof of Completion
                  </label>

                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="border border-gray-300 text-sm rounded-md p-2"
                    />

                    <button
                      onClick={submitProof}
                      disabled={uploading}
                      className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
                    >
                      {uploading ? "Uploading..." : "Submit Proof"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-10">Loading task details...</p>
        )}
      </div>
    </DashboardLayout>
  )
}

export default TaskDetails

// ========== SUB COMPONENTS ==========

const InfoBox = ({ label, value }) => (
  <>
    <label className="text-xs font-medium text-slate-500">{label}</label>
    <p className="text-sm font-medium text-gray-700 mt-0.5">{value}</p>
  </>
)

const TodoCheckList = ({ text, isChecked, onChange }) => (
  <div className="flex items-center gap-3 p-3">
    <input
      type="checkbox"
      checked={isChecked}
      onChange={onChange}
      className="w-4 h-4 text-primary bg-gray-100 border border-gray-300 rounded outline-none cursor-pointer"
    />
    <p className="text-sm text-gray-800">{text}</p>
  </div>
)

const Attachment = ({ link, index, onClick }) => (
  <div
    className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3 mt-2 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex flex-1 items-center gap-3">
      <span className="text-xs text-gray-400 font-semibold mr-2">
        {index < 9 ? `0${index + 1}` : index + 1}
      </span>
      <p className="text-xs text-black truncate">{link}</p>
    </div>
    <FaExternalLinkAlt className="text-gray-500" />
  </div>
)
