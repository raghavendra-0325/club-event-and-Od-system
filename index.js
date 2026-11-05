let express = require('express');
let cors = require('cors');
let app = express();
let studentRoutes = require('./routes/student_routes');
let facultyRoutes = require('./routes/faculty_routes');
let adminRoutes = require('./routes/admin_routes');

app.use(cors());
let mongoose = require('mongoose');

// Connect to MongoDB Compass (database: club_event_management)
mongoose.connect('mongodb://localhost:27017/club_event_management').then(() => {
  console.log("Connected to MongoDB (club_event_management)");
}).catch((err) => {
  console.error("Error connecting to MongoDB:", err);
});

app.use(express.json()); // used to collect data from body of request
app.use(express.urlencoded({ extended: true }));

// Root health route
app.get('/', (req, res) => {
  res.send({ status: "success", message: "Campus Club Event and OD Approval API is Running on port 3000" });
});

// Routes
app.use('/api/student', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admin', adminRoutes);

// Postman Endpoints Reference:
// http://localhost:3000/api/student/register => POST
// http://localhost:3000/api/student/login => POST
// http://localhost:3000/api/student/apply-event => POST
// http://localhost:3000/api/student/viewevents => GET
// http://localhost:3000/api/student/apply-od => POST
// http://localhost:3000/api/student/viewod => GET
// http://localhost:3000/api/faculty/view-pending-events => GET
// http://localhost:3000/api/faculty/approve-event/:id => PATCH
// http://localhost:3000/api/faculty/reject-event/:id => PATCH
// http://localhost:3000/api/faculty/view-pending-od => GET
// http://localhost:3000/api/faculty/approve-od/:id => PATCH
// http://localhost:3000/api/faculty/reject-od/:id => PATCH
// http://localhost:3000/api/admin/viewusers => GET
// http://localhost:3000/api/admin/deleteuser/:id => DELETE
// http://localhost:3000/api/admin/stats => GET

app.listen(3000, () => {
  console.log("server listening on port 3000");
});
