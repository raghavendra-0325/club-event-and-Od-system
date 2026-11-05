const express = require('express');
const router = express.Router();
const Club = require('../models/Club');
const ApprovalLog = require('../models/ApprovalLog');

// GET /api/clubs - List all clubs
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const clubs = await Club.find(query)
      .populate('facultyAdvisor', 'name email department identifier')
      .populate('studentLead', 'name email department identifier')
      .populate('members', 'name email identifier department')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: clubs.length, data: clubs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/clubs/:id - Get single club
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('facultyAdvisor', 'name email department identifier designation')
      .populate('studentLead', 'name email department identifier')
      .populate('members', 'name email identifier department');

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    res.json({ success: true, data: club });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/clubs - Create new club
router.post('/', async (req, res) => {
  try {
    const { name, code, category, description, facultyAdvisor, studentLead, themeColor } = req.body;

    const existingClub = await Club.findOne({ $or: [{ name }, { code: code.toUpperCase() }] });
    if (existingClub) {
      return res.status(400).json({ success: false, message: 'A club with this name or code already exists' });
    }

    const club = new Club({
      name,
      code: code.toUpperCase(),
      category: category || 'Technical',
      description,
      facultyAdvisor,
      studentLead: studentLead || null,
      members: studentLead ? [studentLead] : [],
      themeColor: themeColor || '#3b82f6'
    });

    const savedClub = await club.save();

    await ApprovalLog.create({
      entityType: 'Club',
      entityId: savedClub._id,
      entityTitle: savedClub.name,
      actorName: 'System / Admin',
      actorRole: 'admin',
      action: 'CREATED',
      remarks: `Club ${savedClub.name} (${savedClub.code}) created.`
    });

    const populatedClub = await Club.findById(savedClub._id)
      .populate('facultyAdvisor', 'name email department')
      .populate('studentLead', 'name email department');

    res.status(201).json({ success: true, message: 'Club created successfully', data: populatedClub });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/clubs/:id - Update club details
router.put('/:id', async (req, res) => {
  try {
    const { name, category, description, facultyAdvisor, studentLead, status, themeColor } = req.body;
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    if (name) club.name = name;
    if (category) club.category = category;
    if (description) club.description = description;
    if (facultyAdvisor) club.facultyAdvisor = facultyAdvisor;
    if (studentLead !== undefined) club.studentLead = studentLead;
    if (status) club.status = status;
    if (themeColor) club.themeColor = themeColor;

    const updatedClub = await club.save();

    await ApprovalLog.create({
      entityType: 'Club',
      entityId: updatedClub._id,
      entityTitle: updatedClub.name,
      actorName: 'Admin / Faculty',
      actorRole: 'faculty',
      action: 'UPDATED',
      remarks: `Club ${updatedClub.name} updated.`
    });

    res.json({ success: true, message: 'Club updated successfully', data: updatedClub });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/clubs/:id - Delete club
router.delete('/:id', async (req, res) => {
  try {
    const club = await Club.findByIdAndDelete(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    await ApprovalLog.create({
      entityType: 'Club',
      entityId: club._id,
      entityTitle: club.name,
      actorName: 'Admin',
      actorRole: 'admin',
      action: 'DELETED',
      remarks: `Club ${club.name} was removed.`
    });

    res.json({ success: true, message: 'Club deleted successfully', data: club });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/clubs/:id/join - Student joins club
router.post('/:id/join', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required to join' });
    }

    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    if (club.members.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User is already a member of this club' });
    }

    club.members.push(userId);
    await club.save();

    res.json({ success: true, message: 'Joined club successfully', data: club });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
