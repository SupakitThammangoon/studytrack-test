const express = require('express');
const router = express.Router();
const {
  sendInvitation,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
} = require('../controllers/invitationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // ทุก route ต้อง login

router.route('/')
  .post(sendInvitation)
  .get(getMyInvitations);

router.put('/:id/accept', acceptInvitation);
router.put('/:id/reject', rejectInvitation);

module.exports = router;