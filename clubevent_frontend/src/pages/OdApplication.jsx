import { useState, useEffect } from "react"

function OdApplication() {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}")

    let [student_name, setStudentName] = useState(storedUser.name || "")
    let [roll_no, setRollNo] = useState("")
    let [department, setDepartment] = useState("CSE")
    let [event_name, setEventName] = useState("")
    let [fromDate, setFromDate] = useState("")
    let [toDate, setToDate] = useState("")
    let [reason, setReason] = useState("")
    let [odList, setOdList] = useState([])
    let [loading, setLoading] = useState(false)

    let loadOds = async () => {
        try {
            let res = await fetch('http://localhost:3000/api/student/viewod')
            if (!res.ok) {
                console.error("Server responded with error status:", res.status)
                return
            }
            let data = await res.json()
            setOdList(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Failed to fetch OD requests:", err)
        }
    }

    useEffect(() => {
        loadOds()
    }, [])

    let handleOdSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            let res = await fetch('http://localhost:3000/api/student/apply-od', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_name: student_name || storedUser.name || "Student",
                    roll_no,
                    department,
                    event_name,
                    fromDate,
                    toDate,
                    reason
                })
            })
            let data = await res.json()
            if (res.ok) {
                alert("OD Application submitted successfully! It has been forwarded to Stage 1 (Faculty Advisor) for review.")
                setRollNo("")
                setEventName("")
                setFromDate("")
                setToDate("")
                setReason("")
                await loadOds()
            } else {
                alert("Submission failed: " + (data.error || data.message || "Unknown error"))
            }
        } catch (err) {
            console.error("Error submitting OD application:", err)
            alert("Connection Error! Could not reach backend server at http://localhost:3000: " + err.message)
        } finally {
            setLoading(false)
        }
    }

    let handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this OD application?")) return
        try {
            let res = await fetch(`http://localhost:3000/api/student/delete-od/${id}`, { method: "DELETE" })
            if (res.ok) {
                alert("OD application deleted successfully!")
                loadOds()
            } else {
                alert("Failed to delete OD application")
            }
        } catch (err) {
            console.error(err)
            alert("Error deleting OD application: " + err.message)
        }
    }

    const renderStageBadge = (item) => {
        const s = (item.status || '').toLowerCase()
        if (s === 'approved') return <span className="badge-approved">✓ SANCTIONED (Director)</span>
        if (s === 'rejected') return <span className="badge-rejected">✕ REJECTED</span>
        if (s === 'pending_director') return <span className="badge-pending" style={{ background: "#e9d8fd", color: "#6b46c1" }}>⏳ Stage 3: Awaiting Director</span>
        if (s === 'pending_hod') return <span className="badge-pending" style={{ background: "#feebc8", color: "#c05621" }}>⏳ Stage 2: Awaiting HOD</span>
        return <span className="badge-pending" style={{ background: "#c6f6d5", color: "#22543d" }}>⏳ Stage 1: Awaiting Faculty</span>
    }

    return (
        <div className="page-container">
            <h1>On-Duty (OD) Leave Applications</h1>

            {/* Approval Sequence Note */}
            <div style={{ background: "#edf2f7", padding: "12px 18px", borderRadius: "6px", marginBottom: "20px", fontSize: "13px", color: "#4a5568" }}>
                <strong>Multi-tier Approval Sequence:</strong> Student Submits ➔ Faculty Approves ➔ HOD Endorses ➔ Director/Dean Final Sanction
            </div>

            {/* Submission form: Only students or admins */}
            {(!storedUser.role || storedUser.role === 'student' || storedUser.role === 'admin') && (
                <form onSubmit={handleOdSubmit}>
                    <h3>+ Submit Academic On-Duty (OD) Leave Form</h3>
                    <input
                        type="text"
                        placeholder="Student Full Name"
                        value={student_name}
                        onChange={(e) => setStudentName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Roll Number (e.g. 21CS042)"
                        value={roll_no}
                        onChange={(e) => setRollNo(e.target.value)}
                        required
                    />
                    <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                        <option value="CSE">Computer Science & Engineering</option>
                        <option value="IT">Information Technology</option>
                        <option value="ECE">Electronics & Communication</option>
                        <option value="MECH">Mechanical Engineering</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Event / Competition Name (e.g. IIT Madras Shaastra Hackathon)"
                        value={event_name}
                        onChange={(e) => setEventName(e.target.value)}
                        required
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div>
                            <label style={{ fontSize: "12px", color: "#666" }}>From Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", color: "#666" }}>To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <textarea
                        rows="3"
                        placeholder="Reason for OD (e.g. Presenting research paper or representing college in national finals)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    ></textarea>
                    <button type="submit" disabled={loading}>
                        {loading ? "Submitting..." : "Submit OD Application"}
                    </button>
                </form>
            )}

            <h2>Track OD Applications</h2>
            <table>
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Roll No</th>
                        <th>Department</th>
                        <th>Event Name</th>
                        <th>Dates</th>
                        <th>Approval Stage & Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {odList.map((item) => (
                        <tr key={item._id}>
                            <td><strong>{item.student_name}</strong></td>
                            <td>{item.roll_no}</td>
                            <td>{item.department}</td>
                            <td>{item.event_name}</td>
                            <td>{item.fromDate} to {item.toDate}</td>
                            <td>{renderStageBadge(item)}</td>
                            <td>
                                <button
                                    type="button"
                                    style={{ backgroundColor: "#dc3545" }}
                                    onClick={() => handleDelete(item._id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {odList.length === 0 && (
                        <tr>
                            <td colSpan="7" style={{ textAlign: "center", color: "#888", padding: "20px" }}>No OD requests submitted yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default OdApplication
