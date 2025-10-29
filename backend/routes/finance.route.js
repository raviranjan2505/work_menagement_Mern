import express from 'express';
import { verifyToken, adminOnly } from '../utils/verifyUser.js';
import {
  approveTaskEarning,
  requestWithdrawal,
  approveWithdrawal,
  rejectWithdrawal,
  getUserFinance,
  getAdminFinance,
  getAllWithdrawals
} from '../controller/finance.controller.js';

const router = express.Router();

// Admin approves task earning
// router.post('/task/:taskId/approve', verifyToken, adminOnly, approveTaskEarning);

// User requests withdrawal
router.get("/withdrawals", verifyToken, adminOnly, getAllWithdrawals);
router.post('/withdraw', verifyToken, requestWithdrawal);

// Admin approves/rejects withdrawal
router.post('/withdraw/:withdrawalId/approve', verifyToken, adminOnly, approveWithdrawal);
router.post('/withdraw/:withdrawalId/reject', verifyToken, adminOnly, rejectWithdrawal);

// Finance overviews
router.get('/user', verifyToken, getUserFinance);
router.get('/admin', verifyToken, adminOnly, getAdminFinance);

export default router;
