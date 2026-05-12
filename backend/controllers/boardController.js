const Board = require('../models/Board');
const Task = require('../models/Task');

const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user._id },
        { members: req.user.username },
      ],
    }).sort({ createdAt: -1 });

    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBoard = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'กรุณาระบุชื่อบอร์ด' });
    }

    const board = await Board.create({
      name,
      owner: req.user._id,
      members: [req.user.username],
    });

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'ไม่พบบอร์ด' });
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'ไม่มีสิทธิ์แก้ไข' });
    }

    const updated = await Board.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'ไม่พบบอร์ด' });
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'ไม่มีสิทธิ์ลบ' });
    }

    await Task.deleteMany({ boardId: req.params.id });
    await board.deleteOne();

    res.json({ message: 'ลบบอร์ดสำเร็จ', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { username } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) return res.status(404).json({ message: 'ไม่พบบอร์ด' });

    if (board.members.includes(username)) {
      return res.status(400).json({ message: 'สมาชิกคนนี้อยู่ในบอร์ดแล้ว' });
    }

    board.members.push(username);
    await board.save();

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBoards, createBoard, updateBoard, deleteBoard, addMember };