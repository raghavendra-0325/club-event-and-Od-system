let express = require('express');
let router = express.Router();
let { users } = require('../models/users');
let { events } = require('../models/events');
let { od } = require('../models/od');

// ==================== STAGE 2: HOD APPROVALS ====================

// View events awaiting HOD approval (must have been approved by Faculty)
router.get('/view-hod-events', async (req, res) => {
    try {
        let result = await events.find({
            $or: [
                { current_stage: 'hod' },
                { status: 'pending_hod' }
            ]
        }).sort({ createdAt: -1 });
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// HOD approves event -> forwards to Director/Dean (Stage 3)
router.patch('/hod-approve-event/:id', async (req, res) => {
    try {
        let result = await events.findByIdAndUpdate(
            req.params.id,
            {
                current_stage: 'director',
                status: 'pending_director',
                hod_status: 'approved'
            },
            { new: true }
        );
        res.send({ message: "HOD approved. Forwarded to Director/Dean for final approval.", result });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// HOD rejects event
router.patch('/hod-reject-event/:id', async (req, res) => {
    try {
        let result = await events.findByIdAndUpdate(
            req.params.id,
            {
                status: 'rejected',
                hod_status: 'rejected',
                rejection_reason: req.body.reason || 'Rejected by Head of Department (HOD)'
            },
            { new: true }
        );
        res.send({ message: "Event rejected by HOD.", result });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// View ODs awaiting HOD approval (must have been approved by Faculty)
router.get('/view-hod-od', async (req, res) => {
    try {
        let result = await od.find({
            $or: [
                { current_stage: 'hod' },
                { status: 'pending_hod' }
            ]
        }).sort({ createdAt: -1 });
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// HOD approves OD -> forwards to Director/Dean (Stage 3)
router.patch('/hod-approve-od/:id', async (req, res) => {
    try {
        let result = await od.findByIdAndUpdate(
            req.params.id,
            {
                current_stage: 'director',
                status: 'pending_director',
                hod_status: 'approved'
            },
            { new: true }
        );
        res.send({ message: "HOD approved. Forwarded to Director/Dean for final sanction.", result });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// HOD rejects OD
router.patch('/hod-reject-od/:id', async (req, res) => {
    try {
        let result = await od.findByIdAndUpdate(
            req.params.id,
            {
                status: 'rejected',
                hod_status: 'rejected',
                rejection_reason: req.body.reason || 'Rejected by Head of Department (HOD)'
            },
            { new: true }
        );
        res.send({ message: "OD rejected by HOD.", result });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// ==================== STAGE 3: DIRECTOR / DEAN FINAL APPROVALS ====================

// View events awaiting Director/Dean final approval (must have been approved by HOD)
router.get('/view-director-events', async (req, res) => {
    try {
        let result = await events.find({
            $or: [
                { current_stage: 'director' },
                { status: 'pending_director' }
            ]
        }).sort({ createdAt: -1 });
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Director gives FINAL sanction to event
router.patch('/director-approve-event/:id', async (req, res) => {
    try {
        let result = await events.findByIdAndUpdate(
            req.params.id,
            {
                current_stage: 'completed',
                status: 'approved',
                director_status: 'approved'
            },
            { new: true }
        );
        res.send({ message: "Director/Dean final sanction granted! Event is officially approved.", result });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Director rejects event
router.patch('/director-reject-event/:id', async (req, res) => {
    try {
        let result = await events.findByIdAndUpdate(
            req.params.id,
            {
                status: 'rejected',
                director_status: 'rejected',
                rejection_reason: req.body.reason || 'Rejected by Director / Dean'
            },
            { new: true }
        );
        res.send({ message: "Event rejected by Director / Dean.", result });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// View ODs awaiting Director/Dean final sanction (must have been approved by HOD)
router.get('/view-director-od', async (req, res) => {
    try {
        let result = await od.find({
            $or: [
                { current_stage: 'director' },
                { status: 'pending_director' }
            ]
        }).sort({ createdAt: -1 });
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Director gives FINAL sanction to OD
router.patch('/director-approve-od/:id', async (req, res) => {
    try {
        let result = await od.findByIdAndUpdate(
            req.params.id,
            {
                current_stage: 'completed',
                status: 'approved',
                director_status: 'approved'
            },
            { new: true }
        );
        res.send({ message: "Director/Dean final sanction granted! OD is officially approved.", result });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Director rejects OD
router.patch('/director-reject-od/:id', async (req, res) => {
    try {
        let result = await od.findByIdAndUpdate(
            req.params.id,
            {
                status: 'rejected',
                director_status: 'rejected',
                rejection_reason: req.body.reason || 'Rejected by Director / Dean'
            },
            { new: true }
        );
        res.send({ message: "OD rejected by Director / Dean.", result });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// ==================== GENERAL ADMIN & STATS ====================

// View all registered users
router.get('/viewusers', async (req, res) => {
    try {
        let result = await users.find().select('-password').sort({ createdAt: -1 });
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Delete user
router.delete('/deleteuser/:id', async (req, res) => {
    try {
        let result = await users.findByIdAndDelete(req.params.id);
        res.send({ message: "User deleted successfully", result });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Pipeline stats
router.get('/stats', async (req, res) => {
    try {
        let totalUsers = await users.countDocuments();
        let totalEvents = await events.countDocuments();
        let pendingFacultyEvents = await events.countDocuments({ $or: [{ status: 'pending_faculty' }, { current_stage: 'faculty' }] });
        let pendingHodEvents = await events.countDocuments({ $or: [{ status: 'pending_hod' }, { current_stage: 'hod' }] });
        let pendingDirectorEvents = await events.countDocuments({ $or: [{ status: 'pending_director' }, { current_stage: 'director' }] });
        let approvedEvents = await events.countDocuments({ status: 'approved' });

        let totalOds = await od.countDocuments();
        let pendingFacultyOds = await od.countDocuments({ $or: [{ status: 'pending_faculty' }, { current_stage: 'faculty' }] });
        let pendingHodOds = await od.countDocuments({ $or: [{ status: 'pending_hod' }, { current_stage: 'hod' }] });
        let pendingDirectorOds = await od.countDocuments({ $or: [{ status: 'pending_director' }, { current_stage: 'director' }] });
        let approvedOds = await od.countDocuments({ status: 'approved' });

        res.send({
            totalUsers,
            totalEvents,
            pendingFacultyEvents,
            pendingHodEvents,
            pendingDirectorEvents,
            approvedEvents,
            totalOds,
            pendingFacultyOds,
            pendingHodOds,
            pendingDirectorOds,
            approvedOds
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

module.exports = router;
