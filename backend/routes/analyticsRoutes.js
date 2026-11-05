const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const OdRequest = require('../models/OdRequest');
const ApprovalLog = require('../models/ApprovalLog');

// GET /api/analytics/dashboard - Comprehensive system overview
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalFaculty,
      totalClubs,
      totalEvents,
      approvedEvents,
      pendingEvents,
      totalOds,
      approvedOds,
      pendingOds,
      rejectedOds,
      recentLogs
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      Club.countDocuments({ status: 'active' }),
      Event.countDocuments(),
      Event.countDocuments({ status: 'approved' }),
      Event.countDocuments({ status: { $regex: /^pending_/ } }),
      OdRequest.countDocuments(),
      OdRequest.countDocuments({ status: 'approved' }),
      OdRequest.countDocuments({ status: { $regex: /^pending_/ } }),
      OdRequest.countDocuments({ status: 'rejected' }),
      ApprovalLog.find().sort({ createdAt: -1 }).limit(8)
    ]);

    // Calculate total OD days granted
    const approvedOdDocs = await OdRequest.find({ status: 'approved' }, 'totalDays');
    const totalOdDaysCredited = approvedOdDocs.reduce((acc, curr) => acc + (curr.totalDays || 0), 0);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalClubs,
        events: {
          total: totalEvents,
          approved: approvedEvents,
          pending: pendingEvents
        },
        od: {
          total: totalOds,
          approved: approvedOds,
          pending: pendingOds,
          rejected: rejectedOds,
          totalDaysCredited: totalOdDaysCredited
        }
      },
      recentActivity: recentLogs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
