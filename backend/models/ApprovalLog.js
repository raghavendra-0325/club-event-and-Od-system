const mongoose = require('mongoose');

const ApprovalLogSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ['Event', 'OdRequest', 'Club', 'User'],
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    entityTitle: {
      type: String,
      default: ''
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    actorName: {
      type: String,
      required: true
    },
    actorRole: {
      type: String,
      required: true
    },
    action: {
      type: String,
      enum: [
        'SUBMITTED',
        'FACULTY_APPROVED',
        'HOD_APPROVED',
        'ADMIN_APPROVED',
        'REJECTED',
        'UPDATED',
        'DELETED',
        'CREATED'
      ],
      required: true
    },
    remarks: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ApprovalLog', ApprovalLogSchema);
