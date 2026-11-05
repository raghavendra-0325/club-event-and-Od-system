let express = require('express');
let router = express.Router();
let { events } = require('../models/events');
let { od } = require('../models/od');

// View events pending Stage 1 (Faculty) approval
router.get('/view-pending-events', async (req, res) => {
    try {
        let result = await events.find({
            $or: [
                { current_stage: 'faculty' },
                { status: 'pending_faculty' },
                { status: 'pending' }
            ]
        }).sort({ createdAt: -1 });
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Faculty approves event -> forwards to HOD (Stage 2)
router.patch('/approve-event/:id', async (req, res) => {
    try {
        let result = await events.findByIdAndUpdate(
            req.params.id,
            {
                current_stage: 'hod',
                status: 'pending_hod',
                faculty_status: 'approved'
            },
            { new: true }
        );
        res.send({ message: "Faculty approved. Forwarded to HOD for Stage 2 approval.", result });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Faculty rejects event
router.patch('/reject-event/:id', async (req, res) => {
    try {
        let result = await events.findByIdAndUpdate(
            req.params.id,
            {
                status: 'rejected',
                faculty_status: 'rejected',
                rejection_reason: req.body.reason || 'Rejected by Faculty Advisor'
            },
            { new: true }
        );
        res.send({ message: "Event rejected by Faculty.", result });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// View ODs pending Stage 1 (Faculty) approval
router.get('/view-pending-od', async (req, res) => {
    try {
        let result = await od.find({
            $or: [
                { current_stage: 'faculty' },
                { status: 'pending_faculty' },
                { status: 'pending' }
            ]
        }).sort({ createdAt: -1 });
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Faculty approves OD -> forwards to HOD (Stage 2)
router.patch('/approve-od/:id', async (req, res) => {
    try {
        let result = await od.findByIdAndUpdate(
            req.params.id,
            {
                current_stage: 'hod',
                status: 'pending_hod',
                faculty_status: 'approved'
            },
            { new: true }
        );
        res.send({ message: "Faculty approved. Forwarded to HOD for Stage 2 approval.", result });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Faculty rejects OD
router.patch('/reject-od/:id', async (req, res) => {
    try {
        let result = await od.findByIdAndUpdate(
            req.params.id,
            {
                status: 'rejected',
                faculty_status: 'rejected',
                rejection_reason: req.body.reason || 'Rejected by Faculty Advisor'
            },
            { new: true }
        );
        res.send({ message: "OD application rejected by Faculty.", result });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

module.exports = router;
