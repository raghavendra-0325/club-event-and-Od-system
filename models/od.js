let mongoose = require('mongoose');

let odSchema = mongoose.Schema({
    student_name: {
        type: String,
        required: true
    },
    roll_no: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    event_name: {
        type: String,
        required: true
    },
    fromDate: {
        type: String,
        required: true
    },
    toDate: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    current_stage: {
        type: String,
        enum: ['faculty', 'hod', 'director', 'completed'],
        default: 'faculty'
    },
    status: {
        type: String,
        default: 'pending_faculty'
    },
    faculty_status: {
        type: String,
        default: 'pending'
    },
    hod_status: {
        type: String,
        default: 'pending'
    },
    director_status: {
        type: String,
        default: 'pending'
    },
    rejection_reason: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const od = mongoose.model('od_requests', odSchema);
module.exports = { od };
