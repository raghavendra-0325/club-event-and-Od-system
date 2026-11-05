const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const OdRequest = require('./models/OdRequest');

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/college_db');
  console.log('Connected to MongoDB college_db...');

  await User.deleteMany({});
  await Event.deleteMany({});
  await OdRequest.deleteMany({});

  await User.insertMany([
    { name: 'Rahul Sharma', email: 'rahul@campus.edu', role: 'Student' },
    { name: 'Dr. Priya', email: 'priya@campus.edu', role: 'Faculty' },
    { name: 'Dr. Joseph', email: 'admin@campus.edu', role: 'Admin' }
  ]);

  await Event.insertMany([
    { title: 'AI Hackathon 2026', clubName: 'Coding Club', date: '2026-11-15', venue: 'Lab 3', status: 'Pending' },
    { title: 'RoboWars Workshop', clubName: 'Robotics Club', date: '2026-11-20', venue: 'Auditorium', status: 'Approved' }
  ]);

  await OdRequest.insertMany([
    { studentName: 'Rahul Sharma', rollNo: '21CS042', department: 'CSE', eventName: 'IIT Madras Hackathon', fromDate: '2026-11-10', toDate: '2026-11-11', reason: 'Finals Round', status: 'Pending' }
  ]);

  console.log(' Seeded simple sample data into college_db!');
  process.exit();
}

seed();
