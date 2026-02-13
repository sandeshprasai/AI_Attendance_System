const { createActivityLog } = require('../controllers/adminController/activityController');

/**
 * Activity Logger Utility
 * Use this to log activities throughout the application
 */

const ActivityTypes = {
  STUDENT_ADDED: 'STUDENT_ADDED',
  STUDENT_UPDATED: 'STUDENT_UPDATED',
  STUDENT_DELETED: 'STUDENT_DELETED',
  TEACHER_ADDED: 'TEACHER_ADDED',
  TEACHER_UPDATED: 'TEACHER_UPDATED',
  TEACHER_DELETED: 'TEACHER_DELETED',
  CLASSROOM_CREATED: 'CLASSROOM_CREATED',
  CLASSROOM_UPDATED: 'CLASSROOM_UPDATED',
  CLASSROOM_DELETED: 'CLASSROOM_DELETED',
  ATTENDANCE_MARKED: 'ATTENDANCE_MARKED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
  OTHER: 'OTHER'
};

/**
 * Log an activity
 * @param {Object} params - Activity parameters
 * @param {string} params.activityType - Type of activity from ActivityTypes
 * @param {string} params.description - Description of the activity
 * @param {string} params.performedBy - User ID who performed the action
 * @param {Object} params.relatedEntity - Related entity information
 * @param {string} params.relatedEntity.entityType - Type of entity (Student, Teacher, etc.)
 * @param {string} params.relatedEntity.entityId - ID of the entity
 * @param {Object} params.metadata - Additional metadata
 */
const logActivity = async ({
  activityType,
  description,
  performedBy = null,
  relatedEntity = null,
  metadata = {}
}) => {
  try {
    const activityData = {
      activityType,
      description,
      performedBy,
      relatedEntity,
      metadata
    };

    await createActivityLog(activityData);
  } catch (error) {
    // Don't throw error, just log it to avoid breaking the main flow
    console.error('Failed to log activity:', error);
  }
};

/**
 * Convenience functions for common activities
 */

const logStudentAdded = (studentId, studentName, performedBy, metadata = {}) => {
  return logActivity({
    activityType: ActivityTypes.STUDENT_ADDED,
    description: `New student added: ${studentName}`,
    performedBy,
    relatedEntity: {
      entityType: 'Student',
      entityId: studentId
    },
    metadata: { studentId, studentName, ...metadata }
  });
};

const logTeacherAdded = (teacherId, teacherName, performedBy, metadata = {}) => {
  return logActivity({
    activityType: ActivityTypes.TEACHER_ADDED,
    description: `New teacher added: ${teacherName}`,
    performedBy,
    relatedEntity: {
      entityType: 'Teacher',
      entityId: teacherId
    },
    metadata: { teacherId, teacherName, ...metadata }
  });
};

const logClassroomCreated = (classroomId, classroomName, performedBy, metadata = {}) => {
  return logActivity({
    activityType: ActivityTypes.CLASSROOM_CREATED,
    description: `New classroom created: ${classroomName}`,
    performedBy,
    relatedEntity: {
      entityType: 'Classroom',
      entityId: classroomId
    },
    metadata: { classroomId, classroomName, ...metadata }
  });
};

const logAttendanceMarked = (classId, className, performedBy, metadata = {}) => {
  return logActivity({
    activityType: ActivityTypes.ATTENDANCE_MARKED,
    description: `Attendance marked for ${className}`,
    performedBy,
    relatedEntity: {
      entityType: 'Attendance',
      entityId: classId
    },
    metadata: { classId, className, ...metadata }
  });
};

const logUserLogin = (userId, userName, metadata = {}) => {
  return logActivity({
    activityType: ActivityTypes.USER_LOGIN,
    description: `${userName} logged into the system`,
    performedBy: userId,
    relatedEntity: {
      entityType: 'User',
      entityId: userId
    },
    metadata: { userId, userName, ...metadata }
  });
};

const logUserLogout = (userId, userName, metadata = {}) => {
  return logActivity({
    activityType: ActivityTypes.USER_LOGOUT,
    description: `${userName} logged out of the system`,
    performedBy: userId,
    relatedEntity: {
      entityType: 'User',
      entityId: userId
    },
    metadata: { userId, userName, ...metadata }
  });
};

const logSystemAlert = (alertMessage, metadata = {}) => {
  return logActivity({
    activityType: ActivityTypes.SYSTEM_ALERT,
    description: alertMessage,
    metadata
  });
};

module.exports = {
  ActivityTypes,
  logActivity,
  logStudentAdded,
  logTeacherAdded,
  logClassroomCreated,
  logAttendanceMarked,
  logUserLogin,
  logUserLogout,
  logSystemAlert
};
