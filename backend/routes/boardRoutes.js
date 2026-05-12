const express = require('express');
const router = express.Router();
const {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  addMember,
} = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getBoards).post(createBoard);
router.route('/:id').put(updateBoard).delete(deleteBoard);
router.post('/:id/members', addMember);

module.exports = router;