import User from '../models/user.model.js';
import Task from '../models/task.model.js';
import Withdrawal from '../models/withdrawal.model.js';
import Transaction from '../models/transaction.model.js';
import { errorHandler } from '../utils/error.js';

// Admin approves task earning (supports multiple assigned users)
export const approveTaskEarning = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).populate('assignedTo');

    if (!task) return next(errorHandler(404, 'Task not found'));
    if (task.status !== 'Completed') return next(errorHandler(400, 'Task not completed yet'));
    if (task.earningStatus === 'Approved') return next(errorHandler(400, 'Earning already approved'));

    for (const user of task.assignedTo) {
      user.wallet = (user.wallet || 0) + (task.amount || 0);
      await user.save();

      await Transaction.create({
        user: user._id,
        task: task._id,
        amount: task.amount,
        type: 'credit',
        description: `Earning for task: ${task.title}`,
      });
    }

    task.earningStatus = 'Approved';
    await task.save();

    res.status(200).json({ message: 'Task earning approved', task });
  } catch (error) {
    next(error);
  }
};

// User requests withdrawal
export const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return next(errorHandler(400, 'Invalid amount'));

    const user = await User.findById(req.user.id);
    if (!user) return next(errorHandler(404, 'User not found'));

    if ((user.wallet || 0) < amount) return next(errorHandler(400, 'Insufficient balance'));

    const withdrawal = await Withdrawal.create({ user: user._id, amount, status: 'Pending' });

    res.status(200).json({ message: 'Withdrawal request submitted', withdrawal });
  } catch (error) {
    next(error);
  }
};

// Get all withdrawal requests (Admin only)
export const getAllWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('user', 'name email wallet')
      .sort({ createdAt: -1 });

    res.status(200).json({ withdrawals });
  } catch (error) {
    next(error);
  }
};

// Admin approves withdrawal
export const approveWithdrawal = async (req, res, next) => {
  try {
    const { withdrawalId } = req.params;
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) return next(errorHandler(404, 'Withdrawal not found'));
    if (withdrawal.status !== 'Pending') return next(errorHandler(400, 'Withdrawal already processed'));

    const user = await User.findById(withdrawal.user);
    if (!user) return next(errorHandler(404, 'User not found'));
    if ((user.wallet || 0) < withdrawal.amount) return next(errorHandler(400, 'Insufficient wallet balance'));

    user.wallet -= withdrawal.amount;
    await user.save();

    withdrawal.status = 'Approved';
    await withdrawal.save();

    await Transaction.create({
      user: user._id,
      amount: withdrawal.amount,
      type: 'debit',
      description: 'Withdrawal approved',
    });

    res.status(200).json({ message: 'Withdrawal approved', withdrawal });
  } catch (error) {
    next(error);
  }
};

// Admin rejects withdrawal
export const rejectWithdrawal = async (req, res, next) => {
  try {
    const { withdrawalId } = req.params;
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) return next(errorHandler(404, 'Withdrawal not found'));
    if (withdrawal.status !== 'Pending') return next(errorHandler(400, 'Withdrawal already processed'));

    withdrawal.status = 'Rejected';
    await withdrawal.save();

    res.status(200).json({ message: 'Withdrawal rejected', withdrawal });
  } catch (error) {
    next(error);
  }
};

// User finance overview
export const getUserFinance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(errorHandler(404, 'User not found'));

    const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    const withdrawals = await Withdrawal.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      wallet: user.wallet || 0,
      transactions,
      withdrawals,
    });
  } catch (error) {
    next(error);
  }
};

// Admin finance overview
export const getAdminFinance = async (req, res, next) => {
  try {
    const users = await User.find().select('name email wallet');

    const totalEarningsResult = await Transaction.aggregate([
      { $match: { type: 'credit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalWithdrawalsResult = await Withdrawal.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.status(200).json({
      users,
      totalEarnings: totalEarningsResult[0]?.total || 0,
      totalWithdrawals: totalWithdrawalsResult[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};
