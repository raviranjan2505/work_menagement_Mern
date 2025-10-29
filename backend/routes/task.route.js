import express from 'express';
import { verifyToken, adminOnly } from '../utils/verifyUser.js';
import multer from '../utils/multer.js';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  userDashboardData,
  uploadTaskCompletion,
  approveTaskEarning,
  getCompletedTasks,
  rejectTaskSubmission,
} from '../controller/task.controller.js';

const router = express.Router();

// Admin routes
router.post("/create",verifyToken, adminOnly, multer.array("attachments", 10), createTask);
router.put('/:id', verifyToken, adminOnly,multer.array("attachments", 10), updateTask);
router.get('/dashboard-data', verifyToken, adminOnly, getDashboardData);
router.delete('/:id', verifyToken, adminOnly, deleteTask);

router.get("/completed", verifyToken, getCompletedTasks);
router.post("/:taskId/reject", verifyToken, adminOnly, rejectTaskSubmission);
router.post('/:taskId/approve-earning', verifyToken, adminOnly, approveTaskEarning);

// User routes
router.get('/', verifyToken, getTasks);
router.get('/user-dashboard-data', verifyToken, userDashboardData);
router.get('/:id', verifyToken, getTaskById);
router.put('/:id/status', verifyToken, updateTaskStatus);
router.put('/:id/todo', verifyToken, updateTaskChecklist);

// Task submission by user
router.post(
  "/:taskId/submit",
  verifyToken,
  multer.single("file"),
  uploadTaskCompletion
);


export default router;
