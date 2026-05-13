const Invitation = require('../models/Invitation');
const Board = require('../models/Board');
const User = require('../models/User');

// @desc    ส่งคำเชิญเข้าบอร์ด
// @route   POST /api/invitations
const sendInvitation = async (req, res) => {
  try {
    const { boardId, toUsername } = req.body;

    if (!boardId || !toUsername) {
      return res.status(400).json({ message: 'กรุณาระบุบอร์ดและผู้รับ' });
    }

    // เช็คว่าบอร์ดมีจริง และ user เป็น owner
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'ไม่พบบอร์ด' });
    }
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'เฉพาะเจ้าของบอร์ดเท่านั้นที่เชิญคนอื่นได้' });
    }

    // เช็คว่ามี user คนนี้จริงๆ
    const targetUser = await User.findOne({ username: toUsername });
    if (!targetUser) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้ชื่อนี้' });
    }

    // ห้ามเชิญตัวเอง
    if (toUsername === req.user.username) {
      return res.status(400).json({ message: 'ไม่สามารถเชิญตัวเองได้' });
    }

    // ห้ามเชิญคนที่เป็น member อยู่แล้ว
    if (board.members.includes(toUsername)) {
      return res.status(400).json({ message: 'ผู้ใช้นี้อยู่ในบอร์ดแล้ว' });
    }

    // เช็คว่ามี pending invitation อยู่แล้วหรือยัง
    const existingInvitation = await Invitation.findOne({
      boardId,
      toUser: toUsername,
      status: 'pending',
    });
    if (existingInvitation) {
      return res.status(400).json({ message: 'ส่งคำเชิญไปแล้ว รอผู้รับตอบรับ' });
    }

    // สร้าง invitation
    const invitation = await Invitation.create({
      boardId,
      boardName: board.name,
      fromUser: req.user.username,
      toUser: toUsername,
      status: 'pending',
    });

    res.status(201).json(invitation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ดูคำเชิญที่ส่งมาให้ฉัน
// @route   GET /api/invitations
const getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      toUser: req.user.username,
      status: 'pending',
    }).sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ตอบรับคำเชิญ
// @route   PUT /api/invitations/:id/accept
const acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ message: 'ไม่พบคำเชิญ' });
    }

    // เช็คว่าเป็นคำเชิญของฉันจริงๆ
    if (invitation.toUser !== req.user.username) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์ตอบรับคำเชิญนี้' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'คำเชิญนี้ถูกตอบไปแล้ว' });
    }

    // เพิ่ม user เข้า board.members
    const board = await Board.findById(invitation.boardId);
    if (!board) {
      // บอร์ดถูกลบไปแล้ว — ลบ invitation ทิ้ง
      await invitation.deleteOne();
      return res.status(404).json({ message: 'บอร์ดนี้ไม่มีอยู่แล้ว' });
    }

    if (!board.members.includes(req.user.username)) {
      board.members.push(req.user.username);
      await board.save();
    }

    invitation.status = 'accepted';
    await invitation.save();

    res.json({ message: 'เข้าร่วมบอร์ดสำเร็จ', board });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ปฏิเสธคำเชิญ
// @route   PUT /api/invitations/:id/reject
const rejectInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ message: 'ไม่พบคำเชิญ' });
    }

    if (invitation.toUser !== req.user.username) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์ปฏิเสธคำเชิญนี้' });
    }

    invitation.status = 'rejected';
    await invitation.save();

    res.json({ message: 'ปฏิเสธคำเชิญแล้ว' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendInvitation,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
};