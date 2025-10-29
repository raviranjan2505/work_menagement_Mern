import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  task: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    status: { type: String, enum: ["Pending", "In Progress", "Completed", "Rejected"], default: "Pending" },
    dueDate: { type: Date, required: true },
    amount: { type: Number, default: 0 },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    attachments: [{ type: String }],
    todoChecklist: [todoSchema],
    progress: { type: Number, default: 0 },
    earningStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    userFiles: [{ type: String }],
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
