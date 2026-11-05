let express = require('express');
let router = express.Router();
let { users } = require('../models/users');
let { events } = require('../models/events');
let { od } = require('../models/od');
let bcrypt = require('bcryptjs');

// Register user (Student, Faculty, HOD, Director, Admin)
router.post('/register', async (req, res) => {
    try {
        let data = req.body;
        let existing = await users.findOne({ email: data.email });
        if (existing) {
            return res.status(400).send({ message: "Email already exists" });
        }
        data.password = await bcrypt.hash(data.password, 10);
        let newuser = new users(data);
        let result = await newuser.save();
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        let data = req.body;
        let user = await users.findOne({ email: data.email });
        if (user) {
            let passcheck = await bcrypt.compare(data.password, user.password);
            if (passcheck) {
                // If role was specified in login, check matching
                if (data.role && data.role !== user.role && user.role !== 'admin') {
                    return res.status(403).send({ message: `Access denied. Account role is '${user.role}', not '${data.role}'.` });
                }
                res.send({
                    message: "login successfull",
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            } else {
                res.status(400).send({ message: "password wrong" });
            }
        } else {
            res.status(404).send({ message: "user not found" });
        }
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Student applies / proposes new Club Event -> Enters Stage 1 (Faculty)
router.post('/apply-event', async (req, res) => {
    try {
        let data = req.body || {};
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send({
                error: "Request body is empty! In Postman: Click 'Body' tab -> Select 'raw' -> Choose 'JSON' from dropdown -> Paste event JSON"
            });
        }
        data.current_stage = 'faculty';
        data.status = 'pending_faculty';
        data.faculty_status = 'pending';
        data.hod_status = 'pending';
        data.director_status = 'pending';

        let newevent = new events(data);
        let result = await newevent.save();
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// View all events
router.get('/viewevents', async (req, res) => {
    try {
        let result = await events.find().sort({ createdAt: -1 });
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Student applies for OD -> Enters Stage 1 (Faculty)
router.post('/apply-od', async (req, res) => {
    try {
        let data = req.body || {};
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send({
                error: "Request body is empty! In Postman: Click 'Body' tab -> Select 'raw' -> Choose 'JSON' from dropdown -> Paste OD JSON"
            });
        }
        data.current_stage = 'faculty';
        data.status = 'pending_faculty';
        data.faculty_status = 'pending';
        data.hod_status = 'pending';
        data.director_status = 'pending';

        let newod = new od(data);
        let result = await newod.save();
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// View all OD requests
router.get('/viewod', async (req, res) => {
    try {
        let result = await od.find().sort({ createdAt: -1 });
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Delete event
router.delete('/delete-event/:id', async (req, res) => {
    try {
        let result = await events.findByIdAndDelete(req.params.id);
        res.send({ message: "event deleted", result });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Delete OD request
router.delete('/delete-od/:id', async (req, res) => {
    try {
        let result = await od.findByIdAndDelete(req.params.id);
        res.send({ message: "od deleted", result });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

module.exports = router;
