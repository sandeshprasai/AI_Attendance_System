const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  activityType: {
    type: String,
    required: true,
    enum: [
      'STUDENT_ADDED',
      'STUDENT_UPDATED',
      'STUDENT_DELETED',
      'TEACHER_ADDED',
      'TEACHER_UPDATED',
      'TEACHER_DELETED',
      'CLASSROOM_CREATED',
      'CLASSROOM_UPDATED',
      'CLASSROOM_DELETED',
      'ATTENDANCE_MARKED',
      'USER_LOGIN',
      'USER_LOGOUT',
      'SYSTEM_ALERT',
      'OTHER'
    ]
  },
  description: {
    type: String,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: false
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['Student', 'Teacher', 'Classroom', 'User', 'Attendance', 'System']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ activityType: 1 });
activityLogSchema.index({ performedBy: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
