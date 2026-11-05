let mongoose = require('mongoose');

let eventSchema = mongoose.Schema({
    event_name: {
        type: String,
        required: true
    },
    club_name: {
        type: String,
        required: true
    },
    event_desc: {
        type: String,
        required: true
    },
    event_date: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    submittedBy: {
        type: String,
        default: 'Student'
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

const events = mongoose.model('events', eventSchema);
module.exports = { events };
