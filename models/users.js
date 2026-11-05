let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'hod', 'director', 'admin'],
        default: 'student'
    }
}, {
    timestamps: true
});

let users = mongoose.model('users', userSchema);
module.exports = { users };
