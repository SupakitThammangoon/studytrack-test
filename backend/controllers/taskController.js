const Task = require('../models/Task');
const Board = require('../models/Board');

// Helper: หา board IDs ที่ user เข้าถึงได้
const getUserBoardIds = async (user) => {
  const boards = await Board.find({
    $or: [
      { owner: user._id },
      { members: user.username },
    ],
  }).select('_id');
  return boards.map((b) => b._id);
};

// @desc    ดู tasks (เฉพาะที่ user เข้าถึงได้)
// @route   GET /api/tasks?boardId=xxx
const getTasks = async (req, res) => {
  try {
    const { boardId } = req.query;

    // หาบอร์ดทั้งหมดที่ user เข้าถึงได้
    const userBoardIds = await getUserBoardIds(req.user);

    let filter;
    if (boardId) {
      // ขอ task ของบอร์ดเฉพาะ — ต้องเช็คว่า user เข้าถึงบอร์ดนั้นได้ไหม
      const hasAccess = userBoardIds.some((id) => id.toString() === boardId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึงบอร์ดนี้' });
      }
      filter = { boardId };
    } else {
      // ไม่ระบุบอร์ด → เอาเฉพาะ tasks ของบอร์ดที่ user เข้าถึงได้
      filter = { boardId: { $in: userBoardIds } };
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    สร้าง task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, desc, status, dueDate, boardId } = req.body;

    if (!title || !boardId) {
      return res.status(400).json({ message: 'กรุณาระบุชื่องานและบอร์ด' });
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'ไม่พบบอร์ด' });
    }

    // เช็คว่า user เข้าถึงบอร์ดได้ไหม (เป็น owner หรือ member)
    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.includes(req.user.username);
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์สร้างงานในบอร์ดนี้' });
    }

    const task = await Task.create({
      title,
      desc: desc || '',
      status: status || 'todo',
      dueDate: dueDate || null,
      boardId,
      createdBy: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    อัปเดต task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'ไม่พบงาน' });
    }

    // เช็คสิทธิ์: ต้องเข้าถึงบอร์ดของ task นี้ได้
    const board = await Board.findById(task.boardId);
    if (!board) {
      return res.status(404).json({ message: 'ไม่พบบอร์ด' });
    }
    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.includes(req.user.username);
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์แก้ไขงานนี้' });
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ลบ task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'ไม่พบงาน' });
    }

    // เช็คสิทธิ์
    const board = await Board.findById(task.boardId);
    if (!board) {
      return res.status(404).json({ message: 'ไม่พบบอร์ด' });
    }
    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.includes(req.user.username);
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์ลบงานนี้' });
    }

    await task.deleteOne();
    res.json({ message: 'ลบงานสำเร็จ', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };