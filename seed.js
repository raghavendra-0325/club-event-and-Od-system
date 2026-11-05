let mongoose = require('mongoose');
let { users } = require('./models/users');
let { events } = require('./models/events');
let { od } = require('./models/od');
let bcrypt = require('bcryptjs');

async function seed() {
    await mongoose.connect('mongodb://localhost:27017/club_event_management');
    console.log("Connected to MongoDB (club_event_management)...");

    await users.deleteMany({});
    await events.deleteMany({});
    await od.deleteMany({});

    let pass = await bcrypt.hash("123456", 10);

    // 1. Users for all 4 roles in the cycle
    await users.insertMany([
        { name: "Aarav Sharma (Student)", email: "student@campus.edu", password: pass, role: "student" },
        { name: "Dr. Priya Raman (Faculty Advisor)", email: "faculty@campus.edu", password: pass, role: "faculty" },
        { name: "Dr. K. Venkataraman (HOD CSE)", email: "hod@campus.edu", password: pass, role: "hod" },
        { name: "Dr. Margaret Joseph (Director / Dean)", email: "director@campus.edu", password: pass, role: "director" }
    ]);

    // 2. Events representing each stage of the cycle
    await events.insertMany([
        {
            event_name: "Web3 & Cloud Computing Bootcamp",
            club_name: "Coding Club",
            event_desc: "Student workshop on smart contracts and Kubernetes",
            event_date: "2026-11-20",
            venue: "Tech Auditorium",
            submittedBy: "Aarav Sharma (Student)",
            current_stage: "faculty",
            status: "pending_faculty",
            faculty_status: "pending",
            hod_status: "pending",
            director_status: "pending"
        },
        {
            event_name: "RoboWars & Autonomous Drone Racing",
            club_name: "Robotics Club",
            event_desc: "Hands-on quadcopter assembly & obstacle racing",
            event_date: "2026-11-25",
            venue: "Robotics Arena",
            submittedBy: "Aarav Sharma (Student)",
            current_stage: "hod",
            status: "pending_hod",
            faculty_status: "approved",
            hod_status: "pending",
            director_status: "pending"
        },
        {
            event_name: "National Level HackNova 2026",
            club_name: "AI & Innovation Club",
            event_desc: "24-hour inter-college AI hackathon with corporate sponsors",
            event_date: "2026-12-05",
            venue: "Main Campus Auditorium",
            submittedBy: "Aarav Sharma (Student)",
            current_stage: "director",
            status: "pending_director",
            faculty_status: "approved",
            hod_status: "approved",
            director_status: "pending"
        }
    ]);

    // 3. OD Requests representing each stage of the cycle
    await od.insertMany([
        {
            student_name: "Aarav Sharma",
            roll_no: "21CS042",
            department: "CSE",
            event_name: "Smart India Hackathon Zonal Round",
            fromDate: "2026-11-15",
            toDate: "2026-11-17",
            reason: "Team lead representing college at national finals",
            current_stage: "faculty",
            status: "pending_faculty",
            faculty_status: "pending",
            hod_status: "pending",
            director_status: "pending"
        },
        {
            student_name: "Sneha Patel",
            roll_no: "22EC018",
            department: "ECE",
            event_name: "Inter-College Badminton Championship",
            fromDate: "2026-11-22",
            toDate: "2026-11-23",
            reason: "Representing university in state-level championship",
            current_stage: "hod",
            status: "pending_hod",
            faculty_status: "approved",
            hod_status: "pending",
            director_status: "pending"
        },
        {
            student_name: "Kavya Menon",
            roll_no: "21CS088",
            department: "CSE",
            event_name: "IEEE International Conference on Neural Networks",
            fromDate: "2026-12-01",
            toDate: "2026-12-03",
            reason: "Presenting research paper on Vision Transformers",
            current_stage: "director",
            status: "pending_director",
            faculty_status: "approved",
            hod_status: "approved",
            director_status: "pending"
        }
    ]);

    console.log("Seeding complete! Initialized roles: student, faculty, hod, director with sample cycle data.");
    process.exit();
}

seed();
