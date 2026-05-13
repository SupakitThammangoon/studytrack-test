const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    boardName: {
      type: String,
      required: true,
    },
    fromUser: {
      type: String, // username ของคนเชิญ
      required: true,
    },
    toUser: {
      type: String, // username ของคนถูกเชิญ
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// ป้องกันการเชิญซ้ำ: ห้ามมี pending invitation ของ user เดียวกัน ในบอร์ดเดียวกัน
invitationSchema.index(
  { boardId: 1, toUser: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
  }
);

module.exports = mongoose.model('Invitation', invitationSchema);