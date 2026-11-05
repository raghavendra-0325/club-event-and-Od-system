const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// MongoDB Compass Connection URL
const MONGO_URI = 'mongodb://127.0.0.1:27017/college_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log(' Connected to MongoDB! Open MongoDB Compass and connect to: mongodb://localhost:27017'))
  .catch((err) => console.error(' MongoDB Connection Error:', err.message));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/od', require('./routes/odRoutes'));

// Serve Frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
