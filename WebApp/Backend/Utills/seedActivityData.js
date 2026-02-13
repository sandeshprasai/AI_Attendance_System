/**
 * Seed Script for Activity Logs
 * Run this script to populate sample activity data for testing
 * 
 * Usage: node seedActivityData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ActivityLog = require('../models/activityLog');

const sampleActivities = [
  {
    activityType: 'STUDENT_ADDED',
    description: 'New student added: John Doe',
    metadata: { studentId: 'STU2025001', studentName: 'John Doe' },
    timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
  },
  {
    activityType: 'TEACHER_ADDED',
    description: 'Teacher assigned to classroom: Prof. Sarah Johnson → Room 301',
    metadata: { teacher: 'Prof. Sarah Johnson', room: 'Room 301' },
    timestamp: new Date(Date.now() - 12 * 60 * 1000) // 12 minutes ago
  },
  {
    activityType: 'CLASSROOM_CREATED',
    description: 'New classroom created: Room 405',
    metadata: { capacity: '30 students', roomName: 'Room 405' },
    timestamp: new Date(Date.now() - 25 * 60 * 1000) // 25 minutes ago
  },
  {
    activityType: 'ATTENDANCE_MARKED',
    description: 'Attendance marked for Class 10-A',
    metadata: { present: 28, absent: 2, className: 'Class 10-A' },
    timestamp: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
  },
  {
    activityType: 'STUDENT_UPDATED',
    description: 'Student profile updated: Emily Davis',
    metadata: { studentId: 'STU2025002', changes: 'Contact information' },
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
  },
  {
    activityType: 'TEACHER_UPDATED',
    description: 'Teacher schedule updated: Dr. Michael Brown',
    metadata: { teacherId: 'TCH2025001', changes: 'Weekly schedule' },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    activityType: 'USER_LOGIN',
    description: 'Admin logged into the system',
    metadata: { userName: 'Admin User', ipAddress: '192.168.1.100' },
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
  },
  {
    activityType: 'CLASSROOM_UPDATED',
    description: 'Classroom capacity updated: Room 302',
    metadata: { roomName: 'Room 302', newCapacity: 35, oldCapacity: 30 },
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
  },
  {
    activityType: 'STUDENT_ADDED',
    description: 'New student added: Sarah Wilson',
    metadata: { studentId: 'STU2025003', studentName: 'Sarah Wilson' },
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
  },
  {
    activityType: 'ATTENDANCE_MARKED',
    description: 'Attendance marked for Class 9-B',
    metadata: { present: 30, absent: 1, className: 'Class 9-B' },
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
  },
  {
    activityType: 'SYSTEM_ALERT',
    description: 'System backup completed successfully',
    metadata: { backupSize: '2.5GB', duration: '15 minutes' },
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    activityType: 'TEACHER_ADDED',
    description: 'New teacher added: Dr. Robert Lee',
    metadata: { teacherId: 'TCH2025002', teacherName: 'Dr. Robert Lee', department: 'Mathematics' },
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    activityType: 'CLASSROOM_CREATED',
    description: 'New classroom created: Science Lab 2',
    metadata: { capacity: '25 students', roomName: 'Science Lab 2', type: 'Laboratory' },
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  }
];

const seedActivities = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');

    // Clear existing activities (optional)
    // await ActivityLog.deleteMany({});
    // console.log('Cleared existing activity logs');

    // Insert sample activities
    const result = await ActivityLog.insertMany(sampleActivities);
    console.log(`✅ Successfully seeded ${result.length} activity logs`);

    // Show some stats
    const totalCount = await ActivityLog.countDocuments();
    const typeCount = await ActivityLog.aggregate([
      { $group: { _id: '$activityType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Activity Log Statistics:');
    console.log(`Total activities: ${totalCount}`);
    console.log('\nActivities by type:');
    typeCount.forEach(item => {
      console.log(`  ${item._id}: ${item.count}`);
    });

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedActivities();
