const Task = require('../models/Task');
const Board = require('../models/Board');

const getTasks = async (req, res) => {
  try {
    const { boardId } = req.query;
    const filter = boardId ? { boardId } : {};

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'ไม่พบงาน' });
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'ไม่พบงาน' });
    }

    await task.deleteOne();
    res.json({ message: 'ลบงานสำเร็จ', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };