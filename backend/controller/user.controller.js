import User from "../models/user.model.js";
import Task from "../models/task.model.js";
import { errorHandler } from "../utils/error.js";

// Get all users (admin only) with task counts
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");

    const userWithTaskCounts = await Promise.all(
      users.map(async (user) => {
        const pendingTasks = await Task.countDocuments({ assignedTo: user._id, status: "Pending" });
        const inProgressTasks = await Task.countDocuments({ assignedTo: user._id, status: "In Progress" });
        const completedTasks = await Task.countDocuments({ assignedTo: user._id, status: "Completed" });
        return { ...user._doc, pendingTasks, inProgressTasks, completedTasks };
      })
    );

    res.status(200).json(userWithTaskCounts);
  } catch (err) { next(err); }
};

// Get single user by ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return next(errorHandler(404, "User not found"));
    res.status(200).json(user);
  } catch (err) { next(err); }
};
