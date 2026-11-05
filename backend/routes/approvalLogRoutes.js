const express = require('express');
const router = express.Router();
const ApprovalLog = require('../models/ApprovalLog');

// GET /api/logs - Get recent system activity logs
router.get('/', async (req, res) => {
  try {
    const { entityType, limit = 50 } = req.query;
    const query = {};

    if (entityType && entityType !== 'all') {
      query.entityType = entityType;
    }

    const logs = await ApprovalLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
