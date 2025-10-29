import excelJs from 'exceljs';
import Task from '../models/task.model.js';
import User from '../models/user.model.js';

// ---------------------
// Export all tasks report
// ---------------------
export const exportTaskReport = async (req, res, next) => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'name email');

    const workbook = new excelJs.Workbook();
    const worksheet = workbook.addWorksheet('Tasks Report');

    worksheet.columns = [
      { header: 'Task ID', key: '_id', width: 25 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Priority', key: 'priority', width: 15 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Due Date', key: 'dueDate', width: 20 },
      { header: 'Assigned To', key: 'assignedTo', width: 40 },
      { header: 'Earning Amount', key: 'amount', width: 15 }
    ];

    tasks.forEach(task => {
      const assignedTo = task.assignedTo
        .map(u => `${u.name} (${u.email})`)
        .join(', ');

      worksheet.addRow({
        _id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate.toISOString().split('T')[0],
        assignedTo: assignedTo || 'Unassigned',
        amount: task.amount || 0
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="tasks_report.xlsx"'
    );

    return workbook.xlsx.write(res).then(() => res.end());
  } catch (err) {
    next(err);
  }
};

// ---------------------
// Export all users report
// ---------------------
export const exportUsersReport = async (req, res, next) => {
  try {
    const users = await User.find().select('name email _id').lean();

    const userTasks = await Task.find().populate('assignedTo', 'name email _id');

    const userMap = {};

    users.forEach(user => {
      userMap[user._id] = {
        name: user.name,
        email: user.email,
        taskCount: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        totalEarnings: 0
      };
    });

    userTasks.forEach(task => {
      if (task.assignedTo && task.amount) {
        task.assignedTo.forEach(u => {
          if (userMap[u._id]) {
            userMap[u._id].taskCount += 1;
            userMap[u._id].totalEarnings += task.amount || 0;

            if (task.status === 'Pending') userMap[u._id].pendingTasks += 1;
            else if (task.status === 'In Progress') userMap[u._id].inProgressTasks += 1;
            else if (task.status === 'Completed') userMap[u._id].completedTasks += 1;
          }
        });
      }
    });

    const workbook = new excelJs.Workbook();
    const worksheet = workbook.addWorksheet('User Task Report');

    worksheet.columns = [
      { header: 'User Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 40 },
      { header: 'Total Tasks', key: 'taskCount', width: 15 },
      { header: 'Pending Tasks', key: 'pendingTasks', width: 15 },
      { header: 'In Progress Tasks', key: 'inProgressTasks', width: 15 },
      { header: 'Completed Tasks', key: 'completedTasks', width: 15 },
      { header: 'Total Earnings', key: 'totalEarnings', width: 15 }
    ];

    Object.values(userMap).forEach(u => worksheet.addRow(u));

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="users_report.xlsx"'
    );

    return workbook.xlsx.write(res).then(() => res.end());
  } catch (err) {
    next(err);
  }
};
