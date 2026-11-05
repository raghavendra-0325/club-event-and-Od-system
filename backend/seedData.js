const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Club = require('./models/Club');
const Event = require('./models/Event');
const OdRequest = require('./models/OdRequest');
const ApprovalLog = require('./models/ApprovalLog');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seeder]: Clearing old database collections...');
    await User.deleteMany({});
    await Club.deleteMany({});
    await Event.deleteMany({});
    await OdRequest.deleteMany({});
    await ApprovalLog.deleteMany({});

    console.log('[Seeder]: Creating Users for all roles...');
    // 1. Create Users
    const users = await User.insertMany([
      {
        name: 'Aarav Sharma',
        email: 'student.aarav@campus.edu',
        password: 'password123',
        identifier: '21CS042',
        department: 'Computer Science & Engineering',
        role: 'student',
        phone: '+91 98451 12345',
        designation: 'B.Tech CSE - 3rd Year',
        avatarColor: '#2563eb'
      },
      {
        name: 'Sneha Patel',
        email: 'student.sneha@campus.edu',
        password: 'password123',
        identifier: '22EC018',
        department: 'Electronics & Communication',
        role: 'student',
        phone: '+91 98452 23456',
        designation: 'B.Tech ECE - 2nd Year',
        avatarColor: '#059669'
      },
      {
        name: 'Dr. Priya Raman',
        email: 'faculty.priya@campus.edu',
        password: 'password123',
        identifier: 'FAC-CSE-007',
        department: 'Computer Science & Engineering',
        role: 'faculty',
        phone: '+91 98453 34567',
        designation: 'Associate Professor & Club Advisor',
        avatarColor: '#7c3aed'
      },
      {
        name: 'Prof. Rajesh Kumar',
        email: 'faculty.rajesh@campus.edu',
        password: 'password123',
        identifier: 'FAC-ECE-012',
        department: 'Electronics & Communication',
        role: 'faculty',
        phone: '+91 98454 45678',
        designation: 'Assistant Professor & Robotics Mentor',
        avatarColor: '#ea580c'
      },
      {
        name: 'Dr. K. Venkataraman',
        email: 'hod.cse@campus.edu',
        password: 'password123',
        identifier: 'HOD-CSE-001',
        department: 'Computer Science & Engineering',
        role: 'hod',
        phone: '+91 98455 56789',
        designation: 'Head of the Department - CSE',
        avatarColor: '#0891b2'
      },
      {
        name: 'Dr. Margaret Joseph',
        email: 'dean.admin@campus.edu',
        password: 'password123',
        identifier: 'ADM-DEAN-001',
        department: 'Computer Science & Engineering',
        role: 'admin',
        phone: '+91 98456 67890',
        designation: 'Dean of Student Affairs & Academic Admin',
        avatarColor: '#dc2626'
      }
    ]);

    const studentAarav = users[0];
    const studentSneha = users[1];
    const facultyPriya = users[2];
    const facultyRajesh = users[3];
    const hodCSE = users[4];
    const adminDean = users[5];

    console.log('[Seeder]: Creating Clubs...');
    // 2. Create Clubs
    const clubs = await Club.insertMany([
      {
        name: 'Google Developer Student Club',
        code: 'GDSC',
        category: 'Technical',
        description: 'University-based community group for students interested in Google developer technologies, cloud computing, and AI.',
        facultyAdvisor: facultyPriya._id,
        studentLead: studentAarav._id,
        members: [studentAarav._id, studentSneha._id],
        themeColor: '#3b82f6',
        status: 'active'
      },
      {
        name: 'Robotics & Automation Society',
        code: 'RAS',
        category: 'Technical',
        description: 'Hands-on hardware fabrication, embedded systems, drone development, and autonomous mobile robotics.',
        facultyAdvisor: facultyRajesh._id,
        studentLead: studentSneha._id,
        members: [studentSneha._id],
        themeColor: '#f97316',
        status: 'active'
      },
      {
        name: 'Literary & Debating Society',
        code: 'LDS',
        category: 'Literary',
        description: 'Fosters public speaking, parliamentary debating, creative writing, and MUN competitions.',
        facultyAdvisor: facultyPriya._id,
        studentLead: studentAarav._id,
        members: [studentAarav._id],
        themeColor: '#8b5cf6',
        status: 'active'
      },
      {
        name: 'Rotaract Club of Campus',
        code: 'ROTA',
        category: 'Social Service',
        description: 'Community service, blood donation camps, environmental initiatives, and youth leadership development.',
        facultyAdvisor: facultyRajesh._id,
        studentLead: studentSneha._id,
        members: [studentAarav._id, studentSneha._id],
        themeColor: '#10b981',
        status: 'active'
      }
    ]);

    const clubGDSC = clubs[0];
    const clubRAS = clubs[1];

    console.log('[Seeder]: Creating Sample Events...');
    // 3. Create Events with different workflow stages
    const now = new Date();
    const futureDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const futureDate2 = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
    const futureDate3 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const futureDate4 = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    const events = await Event.insertMany([
      {
        title: 'National Level Hackathon - HackNova 2026',
        club: clubGDSC._id,
        submittedBy: studentAarav._id,
        category: 'Hackathon',
        venue: 'Main Campus Tech Auditorium & Lab 4',
        startDate: futureDate1,
        endDate: futureDate2,
        budget: 45000,
        expectedParticipants: 180,
        description: 'A 24-hour coding hackathon focusing on Generative AI and Web3 solutions with cash prizes and mentor sessions.',
        currentStage: 'completed',
        status: 'approved',
        approvalWorkflow: [
          {
            stage: 'faculty',
            reviewer: facultyPriya._id,
            reviewerName: facultyPriya.name,
            reviewerRole: 'faculty',
            action: 'approved',
            remarks: 'Proposal verified. Lab facilities and faculty mentors assigned.',
            actionDate: new Date(now.getTime() - 48 * 3600000)
          },
          {
            stage: 'hod',
            reviewer: hodCSE._id,
            reviewerName: hodCSE.name,
            reviewerRole: 'hod',
            action: 'approved',
            remarks: 'Department approves scheduling over the weekend. Recommended to Dean.',
            actionDate: new Date(now.getTime() - 24 * 3600000)
          },
          {
            stage: 'admin',
            reviewer: adminDean._id,
            reviewerName: adminDean.name,
            reviewerRole: 'admin',
            action: 'approved',
            remarks: 'Budget sanctioned and auditorium booked. Official permission granted.',
            actionDate: new Date(now.getTime() - 4 * 3600000)
          }
        ]
      },
      {
        title: 'Autonomous Drone Fabrication Workshop',
        club: clubRAS._id,
        submittedBy: studentSneha._id,
        category: 'Workshop',
        venue: 'Robotics Center of Excellence',
        startDate: futureDate3,
        endDate: futureDate4,
        budget: 20000,
        expectedParticipants: 60,
        description: 'Hands-on assembly of quadcopters, PID motor tuning, and obstacle avoidance sensors.',
        currentStage: 'hod',
        status: 'pending_hod',
        approvalWorkflow: [
          {
            stage: 'faculty',
            reviewer: facultyRajesh._id,
            reviewerName: facultyRajesh.name,
            reviewerRole: 'faculty',
            action: 'approved',
            remarks: 'Components safety check completed. Ready for HOD review.',
            actionDate: new Date(now.getTime() - 12 * 3600000)
          }
        ]
      },
      {
        title: 'Cloud Architecture & DevOps Masterclass',
        club: clubGDSC._id,
        submittedBy: studentAarav._id,
        category: 'Guest Lecture',
        venue: 'Seminar Hall 2',
        startDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        budget: 5000,
        expectedParticipants: 120,
        description: 'Industry keynote speaker from Google Cloud addressing containerization and Kubernetes pipelines.',
        currentStage: 'faculty',
        status: 'pending_faculty',
        approvalWorkflow: []
      }
    ]);

    console.log('[Seeder]: Creating Sample OD Requests...');
    // 4. Create OD Requests
    const odRequests = await OdRequest.insertMany([
      {
        odReferenceNumber: 'OD-2026-0001',
        student: studentAarav._id,
        studentRoll: studentAarav.identifier,
        department: studentAarav.department,
        category: 'External College Hackathon',
        eventTitle: 'Smart India Hackathon Regional Round',
        organizationOrCollege: 'IIT Madras Research Park',
        venue: 'IIT Madras Campus, Chennai',
        fromDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        toDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        totalDays: 2,
        reason: 'Selected as team lead among Top 10 national finalists for SIH software edition.',
        proofDocument: 'https://campus-portal.edu/proofs/sih-selection-letter.pdf',
        currentStage: 'completed',
        status: 'approved',
        attendanceCredited: true,
        approvalWorkflow: [
          {
            stage: 'faculty',
            reviewer: facultyPriya._id,
            reviewerName: facultyPriya.name,
            reviewerRole: 'faculty',
            action: 'approved',
            remarks: 'Excellent achievement! Verified confirmation email from IIT Madras.',
            actionDate: new Date(now.getTime() - 5 * 24 * 3600000)
          },
          {
            stage: 'hod',
            reviewer: hodCSE._id,
            reviewerName: hodCSE.name,
            reviewerRole: 'hod',
            action: 'approved',
            remarks: 'Permitted. Midterm lab submission exempted during these 2 days.',
            actionDate: new Date(now.getTime() - 4 * 24 * 3600000)
          },
          {
            stage: 'admin',
            reviewer: adminDean._id,
            reviewerName: adminDean.name,
            reviewerRole: 'admin',
            action: 'approved',
            remarks: 'Sanctioned. 2 days official OD credited to ERP attendance system.',
            actionDate: new Date(now.getTime() - 3 * 24 * 3600000)
          }
        ]
      },
      {
        odReferenceNumber: 'OD-2026-0002',
        student: studentSneha._id,
        studentRoll: studentSneha.identifier,
        department: studentSneha.department,
        category: 'Sports Tournament',
        eventTitle: 'Inter-Collegiate Badminton Championship',
        organizationOrCollege: 'Anna University Sports Board',
        venue: 'Indoor Stadium, Guindy',
        fromDate: futureDate1,
        toDate: futureDate2,
        totalDays: 2,
        reason: 'Representing college badminton team in state-level university tournament.',
        proofDocument: 'https://campus-portal.edu/proofs/sports-board-nomination.pdf',
        currentStage: 'hod',
        status: 'pending_hod',
        attendanceCredited: false,
        approvalWorkflow: [
          {
            stage: 'faculty',
            reviewer: facultyRajesh._id,
            reviewerName: facultyRajesh.name,
            reviewerRole: 'faculty',
            action: 'approved',
            remarks: 'Physical Director endorsement confirmed.',
            actionDate: new Date(now.getTime() - 6 * 3600000)
          }
        ]
      },
      {
        odReferenceNumber: 'OD-2026-0003',
        student: studentAarav._id,
        studentRoll: studentAarav.identifier,
        department: studentAarav.department,
        category: 'Symposium & Paper Presentation',
        eventTitle: 'IEEE International Student Symposium on Neural Networks',
        organizationOrCollege: 'NIT Trichy',
        venue: 'Barn Hall, NIT Trichy',
        fromDate: futureDate3,
        toDate: futureDate4,
        totalDays: 2,
        reason: 'Presenting research paper on Vision Transformers in Embedded Systems.',
        proofDocument: 'https://campus-portal.edu/proofs/ieee-acceptance-letter.pdf',
        currentStage: 'faculty',
        status: 'pending_faculty',
        attendanceCredited: false,
        approvalWorkflow: []
      }
    ]);

    console.log('[Seeder]: Creating Initial Audit Logs...');
    // 5. Create Approval Logs
    await ApprovalLog.insertMany([
      {
        entityType: 'Event',
        entityId: events[0]._id,
        entityTitle: events[0].title,
        actionBy: adminDean._id,
        actorName: adminDean.name,
        actorRole: 'admin',
        action: 'ADMIN_APPROVED',
        remarks: 'Final institutional sanction given for HackNova 2026.',
        timestamp: new Date(now.getTime() - 4 * 3600000)
      },
      {
        entityType: 'OdRequest',
        entityId: odRequests[0]._id,
        entityTitle: odRequests[0].odReferenceNumber,
        actionBy: adminDean._id,
        actorName: adminDean.name,
        actorRole: 'admin',
        action: 'ADMIN_APPROVED',
        remarks: '2 days attendance credit confirmed for SIH.',
        timestamp: new Date(now.getTime() - 3 * 24 * 3600000)
      },
      {
        entityType: 'OdRequest',
        entityId: odRequests[1]._id,
        entityTitle: odRequests[1].odReferenceNumber,
        actionBy: facultyRajesh._id,
        actorName: facultyRajesh.name,
        actorRole: 'faculty',
        action: 'FACULTY_APPROVED',
        remarks: 'Physical Director endorsement confirmed.',
        timestamp: new Date(now.getTime() - 6 * 3600000)
      }
    ]);

    console.log('[Seeder]: Database seeded successfully with demo users, clubs, events, and OD requests!');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedData();
