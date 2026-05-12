const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // ตัดคำว่า "Bearer " ออก
      token = req.headers.authorization.split(' ')[1];

      // ตรวจสอบ token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ดึงข้อมูล user
      req.user = await User.findById(decoded.id).select('-password');

      return next(); 
    } catch (error) {
      return res.status(401).json({ message: 'Token ไม่ถูกต้อง' });
    }
  }

  // ถ้าไม่มี token ตั้งแต่แรก
  return res.status(401).json({ message: 'ไม่มี token, กรุณา login' });
};

module.exports = { protect };