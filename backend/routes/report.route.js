import express from 'express';
import { verifyToken, adminOnly } from '../utils/verifyUser.js';
import { exportTaskReport, exportUsersReport } from '../controller/report.controller.js';

const router = express.Router();

// Admin exports
router.get('/export/tasks', verifyToken, adminOnly, exportTaskReport);
router.get('/export/users', verifyToken, adminOnly, exportUsersReport);

export default router;
