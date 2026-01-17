import mongoose from "mongoose";
import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
import { errorHandler } from "../utils/error.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, amount } = req.body;

    const assignedTo = JSON.parse(req.body.assignedTo || "[]");
    const todoChecklist = JSON.parse(req.body.todoChecklist || "[]");
    console.log(req.files,"request from create task")

    if (!Array.isArray(assignedTo))
      return res.status(400).json({ message: "assignedTo must be an array of user IDs" });

    const attachments = req.files?.map(
      (file) => `${req.protocol}://${req.get("host")}/uploads/attachments/${file.filename}`
    ) || [];

    const newTask = await Task.create({
      title,
      description,
      priority,
      dueDate,
      amount,
      assignedTo,
      todoChecklist,
      attachments,
      status: "Pending",
    });
    res.status(201).json({ message: "Task created successfully", task: newTask });

  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return next(errorHandler(404, "Task not found"));
    const assignedTo = req.body.assignedTo 
      ? (typeof req.body.assignedTo === 'string' ? JSON.parse(req.body.assignedTo) : req.body.assignedTo)
      : task.assignedTo;

    const todoChecklist = req.body.todoChecklist 
      ? (typeof req.body.todoChecklist === 'string' ? JSON.parse(req.body.todoChecklist) : req.body.todoChecklist)
      : task.todoChecklist;
    let attachments = [...task.attachments];
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(
        (file) => `${req.protocol}://${req.get("host")}/uploads/attachments/${file.filename}`
      );
      attachments = [...attachments, ...newAttachments];
    }
    Object.assign(task, {
      title: req.body.title || task.title,
      description: req.body.description || task.description,
      priority: req.body.priority || task.priority,
      dueDate: req.body.dueDate || task.dueDate,
      amount: req.body.amount !== undefined ? req.body.amount : task.amount,
      attachments: attachments,
      todoChecklist: todoChecklist,
      assignedTo: assignedTo,
    });

    await task.save();
    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const { status } = req.query;
    let filter = status ? { status } : {};
    let tasks;
    if (req.user.role === "admin") {
      tasks = await Task.find(filter).populate("assignedTo", "name email profileImageUrl");
    } else {
      tasks = await Task.find({ ...filter, assignedTo: req.user.id }).populate("assignedTo", "name email profileImageUrl");
    }
    tasks = tasks.map(task => {
      const completedCount = task.todoChecklist.filter(item => item.completed).length;
      return { ...task._doc, completedCount };
    });
    const allTasks = await Task.countDocuments(
      req.user.role === "admin" ? {} : { assignedTo: req.user.id }
    )

    const pendingTasks = await Task.countDocuments({
      ...filter,
      status: "Pending",
      ...(req.user.role !== "admin" && { assignedTo: req.user.id }),
    })

    const inProgressTasks = await Task.countDocuments({
      ...filter,
      status: "In Progress",
      ...(req.user.role !== "admin" && { assignedTo: req.user.id }),
    })

    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "Completed",
      ...(req.user.role !== "admin" && { assignedTo: req.user.id }),
    })

    res.status(200).json({
      tasks,
      statusSummary: {
        all: allTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
      },
    })
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate("assignedTo", "name email profileImageUrl");
    if (!task) return next(errorHandler(404, "Task not found"));
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};


export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return next(errorHandler(404, "Task not found"));
    await task.deleteOne();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return next(errorHandler(404, "Task not found"));
    if (!task.assignedTo.includes(req.user.id) && req.user.role !== "admin") {
      return next(errorHandler(403, "Unauthorized"));
    }

    task.status = req.body.status || task.status;
    if (task.status === "Completed") task.todoChecklist.forEach(item => item.completed = true);
    await task.save();

    res.status(200).json({ message: "Task status updated", task });
  } catch (error) {
    next(error);
  }
};

export const updateTaskChecklist = async (req, res, next) => {
  try {
    const { todoChecklist } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return next(errorHandler(404, "Task not found"));

    if (!task.assignedTo.includes(req.user.id) && req.user.role !== "admin") {
      return next(errorHandler(403, "Not authorized to update checklist"));
    }

    task.todoChecklist = todoChecklist;
    const completedCount = todoChecklist.filter(item => item.completed).length;
    task.progress = todoChecklist.length > 0 ? Math.round((completedCount / todoChecklist.length) * 100) : 0;

    task.status = task.progress === 100 ? "Completed" : task.progress > 0 ? "In Progress" : "Pending";

    await task.save();
    res.status(200).json({ message: "Task checklist updated", task });
  } catch (error) {
    next(error);
  }
};

export const uploadTaskCompletion = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return next(errorHandler(404, "Task not found"));
    if (!task.assignedTo.includes(req.user.id)) return next(errorHandler(403, "Not authorized"));

    if (!req.file) return next(errorHandler(400, "File is required"));

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/userFiles/${req.file.filename}`;

    task.userFiles.push(fileUrl);
    task.status = "Completed";
    task.earningStatus = "Pending"; 
    await task.save();

    res.status(200).json({ message: "Task submitted for review", task });
  } catch (error) {
    next(error);
  }
};


export const approveTaskEarning = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId).populate("assignedTo");
    if (!task) return next(errorHandler(404, "Task not found"));
    if (task.earningStatus === "Approved") return next(errorHandler(400, "Earning already approved"));

    for (const user of task.assignedTo) {
      user.wallet = (user.wallet || 0) + (task.amount || 0);
      await user.save();

      await Transaction.create({
        user: user._id,
        task: task._id,
        amount: task.amount,
        type: "credit",
        description: `Earning for task: ${task.title}`,
      });
    }

    task.earningStatus = "Approved";
    await task.save();

    res.status(200).json({ message: "Task earning approved", task });
  } catch (error) {
    next(error);
  }
};


export const getCompletedTasks = async (req, res, next) => {
  try {
    let filter = { status: "Completed" };

    if (req.user.role !== "admin") {
      filter.assignedTo = req.user.id;
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email profileImageUrl")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectTaskSubmission = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId).populate("assignedTo");
    if (!task) return next(errorHandler(404, "Task not found"));

    if (task.earningStatus === "Approved")
      return next(errorHandler(400, "Task already approved — cannot reject"));

    task.earningStatus = "Rejected";
    task.status = "Rejected";
    await task.save();
    for (const user of task.assignedTo) {
      await Transaction.create({
        user: user._id,
        task: task._id,
        amount: 0,
        type: "debit",
        description: `Task rejected by admin: ${task.title}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Task submission rejected successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};

// Admin dashboard
export const getDashboardData = async (req, res, next) => {
  try {
    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: "Pending" });
    const completedTasks = await Task.countDocuments({ status: "Completed" });
    const overdueTasks = await Task.countDocuments({ status: { $ne: "Completed" }, dueDate: { $lt: new Date() } });

    const recentTasks = await Task.find().sort({ createdAt: -1 }).limit(10).select("title status priority dueDate createdAt");

    res.status(200).json({ statistics: { totalTasks, pendingTasks, completedTasks, overdueTasks }, recentTasks });
  } catch (error) {
    next(error);
  }
};

// User dashboard
export const userDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: "Pending" });
    const completedTasks = await Task.countDocuments({ assignedTo: userId, status: "Completed" });
    const overdueTasks = await Task.countDocuments({ assignedTo: userId, status: { $ne: "Completed" }, dueDate: { $lt: new Date() } });

    const recentTasks = await Task.find({ assignedTo: userId }).sort({ createdAt: -1 }).limit(10).select("title status priority dueDate createdAt");

    res.status(200).json({ statistics: { totalTasks, pendingTasks, completedTasks, overdueTasks }, recentTasks });
  } catch (error) {
    next(error);
  }
};
