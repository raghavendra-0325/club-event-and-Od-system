const express = require('express');
const router = express.Router();
const OdRequest = require('../models/OdRequest');

// GET all OD requests
router.get('/', async (req, res) => {
  try {
    const list = await OdRequest.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST submit OD application (Student)
router.post('/', async (req, res) => {
  try {
    const newOd = new OdRequest(req.body);
    const savedOd = await newOd.save();
    res.status(201).json(savedOd);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update OD status (Faculty / Admin: Approved or Rejected)
router.put('/:id', async (req, res) => {
  try {
    const updatedOd = await OdRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updatedOd);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE OD request
router.delete('/:id', async (req, res) => {
  try {
    await OdRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'OD Request deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
