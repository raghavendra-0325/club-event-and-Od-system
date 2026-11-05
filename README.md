# Campus Club Event & On-Duty (OD) Approval System

A full-stack, enterprise-grade college workflow management system for managing student clubs, event proposals, and multi-tier academic On-Duty (OD) leave approvals.

---

## 🏛️ 1. Project Roles & Hierarchy

The system defines 4 distinct roles, each with specific authorization levels in the approval pipeline:

1. **Student (`student`)**:
   - Browse recognized campus clubs and join them.
   - Propose new Club Events (Hackathons, Workshops, Symposiums, Guest Lectures, Cultural Fests).
   - Apply for academic On-Duty (OD) leave for external and internal events (paper presentations, hackathons, sports tournaments).
   - Track live multi-stage approval progress in real-time.
   - View and print official, digitally verified OD clearance slips.

2. **Faculty Advisor / Club In-Charge (`faculty`)**:
   - First-level verification authority (Stage 1).
   - Scrutinizes event proposals originating from their assigned club.
   - Endorses or rejects student OD applications from their department or club.
   - Forwards approved applications to the Head of Department (HOD).

3. **Head of Department (`hod`)**:
   - Department-level academic scrutiny authority (Stage 2).
   - Verifies student attendance percentage and ensures event scheduling does not conflict with exams or internal assessments.
   - Recommends approved requests to the Dean / Institutional Admin.

4. **Dean of Student Affairs / Institutional Admin (`admin`)**:
   - Final institutional sanctioning authority (Stage 3).
   - Sanctions college budget and books campus auditoriums/venues.
   - Officially credits attendance to the college ERP for OD requests.
   - Full CRUD administration over Users, Clubs, Events, OD Requests, and System Audit Logs.

---

## 🗄️ 2. Database & Collections (MongoDB)

Database Name: `club_od_approval_db`

### Collections ("Tables"):

| Collection | Model File | Purpose |
| :--- | :--- | :--- |
| `users` | `backend/models/User.js` | Stores user profiles, credentials, roll/staff IDs, department, and assigned role (`student`, `faculty`, `hod`, `admin`). |
| `clubs` | `backend/models/Club.js` | Stores student clubs/societies, category, theme colors, Faculty Advisor (ref), Student Lead (ref), and members list. |
| `events` | `backend/models/Event.js` | Stores event proposals, budget, venue, dates, status (`pending_faculty`, `pending_hod`, `pending_admin`, `approved`, `rejected`), and step-by-step audit workflow history. |
| `odrequests` | `backend/models/OdRequest.js` | Stores On-Duty applications, reference numbers (`OD-2026-0001`), date ranges, total days, verified documents, and clearance records. |
| `approvallogs` | `backend/models/ApprovalLog.js` | Comprehensive audit trail logging every submission, approval, forwarding, and rejection action with timestamps and reviewer remarks. |

---

## 🚀 3. REST API Routes & CRUD Operations

CORS is enabled for all origins and HTTP methods (`GET, POST, PUT, DELETE, PATCH, OPTIONS`).

### User Management (`/api/users`)
- `GET /api/users` - List all users (supports `?role=`, `?department=`, `?search=`).
- `GET /api/users/:id` - Fetch single user profile.
- `POST /api/users` - Create / register new user.
- `PUT /api/users/:id` - Update user details.
- `DELETE /api/users/:id` - Remove user.
- `GET /api/users/meta/roles` - Get available roles and departments list.

### Club Management (`/api/clubs`)
- `GET /api/clubs` - List all active clubs (populated with advisor & student lead).
- `GET /api/clubs/:id` - Get club details and member roster.
- `POST /api/clubs` - Register a new club.
- `PUT /api/clubs/:id` - Update club details.
- `DELETE /api/clubs/:id` - Delete club.
- `POST /api/clubs/:id/join` - Student joins club.

### Event Proposals (`/api/events`)
- `GET /api/events` - List events (supports `?status=`, `?stage=`, `?clubId=`, `?search=`).
- `GET /api/events/:id` - Get event details and approval trail.
- `POST /api/events` - Submit new event proposal (starts at Stage 1: `faculty`).
- `PUT /api/events/:id` - Update event proposal details.
- `DELETE /api/events/:id` - Cancel / delete event proposal.
- `PATCH /api/events/:id/review` - Review step: Approve & forward to next stage or Reject with comments.

### On-Duty (OD) Applications (`/api/od`)
- `GET /api/od` - List OD applications (supports `?status=`, `?stage=`, `?department=`, `?search=`).
- `GET /api/od/:id` - Get single OD application.
- `POST /api/od` - Submit new OD request (generates unique reference number `OD-YYYY-XXXX`).
- `PUT /api/od/:id` - Update OD details while pending.
- `DELETE /api/od/:id` - Cancel / delete OD application.
- `PATCH /api/od/:id/review` - Review step: Faculty -> HOD -> Dean approval.
- `GET /api/od/:id/slip` - Official printable OD clearance slip with cryptographic verification hash.

### System Analytics & Audit (`/api/analytics`, `/api/logs`)
- `GET /api/analytics/dashboard` - Real-time statistics counters and breakdown.
- `GET /api/logs` - Audit trail history across all entities.

---

## 🎨 4. Frontend Application

The frontend is built with clean HTML5, CSS3, and modern vanilla JavaScript:

- **Single Page Application (SPA) UI**:
  - **Dashboard**: Metric counter cards (Active Clubs, Approved Events, Pending ODs, Attendance Credited), quick action launchers, and live audit logs.
  - **Clubs & Societies**: Filterable catalog of recognized campus student bodies, join actions, and club registration.
  - **Event Proposals**: Proposal pipeline with visual multi-stage progress steppers and inline role-specific review buttons (`Approve`, `Reject`).
  - **OD Requests**: Full application pipeline with auto-calculated date ranges, status filters, and **Official Printable OD Clearance Slip Modal**.
  - **User & Roles Directory**: Complete list of students, faculty, and administrative heads with filtering and user creation.
  - **Workflow & Roles Guide**: Full educational reference explaining the approval sequence and permissions.

- **Role Switcher Dropdown**:
  - Switch on the fly between **Student Aarav**, **Student Sneha**, **Faculty Dr. Priya Raman**, **Faculty Prof. Rajesh Kumar**, **HOD Dr. Venkataraman**, and **Dean Dr. Margaret Joseph** to immediately test and demonstrate the entire multi-tier approval workflow!

- **Native `fetch()` API Integration**:
  - All communication in `frontend/js/api.js` is implemented strictly with browser-native `fetch()` calls.

---

## 💻 5. Running the Application

### Prerequisites:
- Node.js (v18+)
- MongoDB (Running on `127.0.0.1:27017`)

### Start Server:
```bash
cd backend
npm install
node seedData.js   # Seeds initial demo users, clubs, events, and ODs
node server.js     # Starts server on http://localhost:5000
```

### Access UI:
Open your browser and navigate to:
**`http://localhost:5000`**
