const mongoose = require('mongoose');

const odSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  rollNo: { type: String, required: true },
  department: { type: String, required: true },
  eventName: { type: String, required: true },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('OdRequest', odSchema);
