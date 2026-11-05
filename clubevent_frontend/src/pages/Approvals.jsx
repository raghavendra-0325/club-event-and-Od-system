import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

function Approvals() {
    const [user, setUser] = useState(null)
    const [stageTab, setStageTab] = useState("faculty") // 'faculty', 'hod', 'director'
    const [pendingEvents, setPendingEvents] = useState([])
    const [pendingOds, setPendingOds] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser)
                setUser(parsed)
                // Set default tab matching the user's role
                if (parsed.role === 'hod') setStageTab('hod')
                if (parsed.role === 'director') setStageTab('director')
                if (parsed.role === 'faculty') setStageTab('faculty')
            } catch (e) {
                setUser(null)
            }
        }
    }, [])

    let loadData = async () => {
        if (!user || user.role === 'student') return

        const activeStage = user.role === 'admin' ? stageTab : user.role

        try {
            let evUrl = 'http://localhost:3000/api/faculty/view-pending-events'
            let odUrl = 'http://localhost:3000/api/faculty/view-pending-od'

            if (activeStage === 'hod') {
                evUrl = 'http://localhost:3000/api/admin/view-hod-events'
                odUrl = 'http://localhost:3000/api/admin/view-hod-od'
            } else if (activeStage === 'director') {
                evUrl = 'http://localhost:3000/api/admin/view-director-events'
                odUrl = 'http://localhost:3000/api/admin/view-director-od'
            }

            let resEv = await fetch(evUrl)
            if (resEv.ok) {
                let dataEv = await resEv.json()
                setPendingEvents(Array.isArray(dataEv) ? dataEv : [])
            }

            let resOd = await fetch(odUrl)
            if (resOd.ok) {
                let dataOd = await resOd.json()
                setPendingOds(Array.isArray(dataOd) ? dataOd : [])
            }
        } catch (err) {
            console.error("Failed to load approval queues:", err)
        }
    }

    useEffect(() => {
        if (user) {
            loadData()
        }
    }, [user, stageTab])

    // ==================== RESTRICTION CHECK ====================
    // If not logged in or role is student: BLOCK ACCESS
    if (!user || user.role === 'student') {
        return (
            <div className="page-container" style={{ textAlign: "center", padding: "60px 20px" }}>
                <h1 style={{ color: "#dc3545", fontSize: "32px", marginBottom: "15px" }}>🚫 Access Denied</h1>
                <p style={{ fontSize: "16px", color: "#555", maxWidth: "600px", margin: "0 auto 25px", lineHeight: "1.6" }}>
                    The <strong>Approval Portal</strong> is strictly restricted to Faculty Advisors, Heads of Department (HOD), and Directors/Deans.
                    Students do not have permission to access or approve applications.
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <Link to="/events"><button type="button">Go to My Events</button></Link>
                    <Link to="/od"><button type="button">Go to My OD Requests</button></Link>
                    <Link to="/login"><button type="button" style={{ background: "#28a745" }}>Login as Faculty / HOD / Director</button></Link>
                </div>
            </div>
        )
    }

    // Determine current review role & URLs
    const currentReviewStage = user.role === 'admin' ? stageTab : user.role

    const handleEventAction = async (id, action) => {
        setLoading(true)
        try {
            let url = ""
            if (currentReviewStage === 'faculty') {
                url = action === 'approve'
                    ? `http://localhost:3000/api/faculty/approve-event/${id}`
                    : `http://localhost:3000/api/faculty/reject-event/${id}`
            } else if (currentReviewStage === 'hod') {
                url = action === 'approve'
                    ? `http://localhost:3000/api/admin/hod-approve-event/${id}`
                    : `http://localhost:3000/api/admin/hod-reject-event/${id}`
            } else if (currentReviewStage === 'director') {
                url = action === 'approve'
                    ? `http://localhost:3000/api/admin/director-approve-event/${id}`
                    : `http://localhost:3000/api/admin/director-reject-event/${id}`
            }

            let res = await fetch(url, { method: "PATCH" })
            let data = await res.json()
            if (res.ok) {
                alert(data.message || `Event proposal ${action}d successfully!`)
                await loadData()
            } else {
                alert(`Action failed: ` + (data.message || data.error))
            }
        } catch (err) {
            alert("Error processing event: " + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleOdAction = async (id, action) => {
        setLoading(true)
        try {
            let url = ""
            if (currentReviewStage === 'faculty') {
                url = action === 'approve'
                    ? `http://localhost:3000/api/faculty/approve-od/${id}`
                    : `http://localhost:3000/api/faculty/reject-od/${id}`
            } else if (currentReviewStage === 'hod') {
                url = action === 'approve'
                    ? `http://localhost:3000/api/admin/hod-approve-od/${id}`
                    : `http://localhost:3000/api/admin/hod-reject-od/${id}`
            } else if (currentReviewStage === 'director') {
                url = action === 'approve'
                    ? `http://localhost:3000/api/admin/director-approve-od/${id}`
                    : `http://localhost:3000/api/admin/director-reject-od/${id}`
            }

            let res = await fetch(url, { method: "PATCH" })
            let data = await res.json()
            if (res.ok) {
                alert(data.message || `OD application ${action}d successfully!`)
                await loadData()
            } else {
                alert(`Action failed: ` + (data.message || data.error))
            }
        } catch (err) {
            alert("Error processing OD: " + err.message)
        } finally {
            setLoading(false)
        }
    }

    const stageTitles = {
        faculty: "Stage 1: Faculty Advisor Review Queue",
        hod: "Stage 2: Head of Department (HOD) Scrutiny Queue (Approved by Faculty)",
        director: "Stage 3: Director / Dean Final Sanction Queue (Approved by HOD)"
    }

    const nextStepInfo = {
        faculty: "Approving here forwards proposal to HOD (Stage 2).",
        hod: "Approving here forwards proposal to Director/Dean (Stage 3).",
        director: "Approving here officially issues final institutional sanction."
    }

    return (
        <div className="page-container">
            <h1>Official Approval Portal</h1>
            <p style={{ color: "#666", marginBottom: "15px" }}>
                Logged in as: <strong>{user.name}</strong> <span style={{ textTransform: "uppercase", background: "#0f3460", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "11px" }}>{user.role}</span>
            </p>

            {/* Visual Multi-tier Cycle Progress Bar */}
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "25px" }}>
                <strong style={{ fontSize: "13px", color: "#333", display: "block", marginBottom: "10px" }}>APPROVAL LIFECYCLE:</strong>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "13px" }}>
                    <span style={{ padding: "6px 12px", borderRadius: "20px", background: "#e2e8f0", fontWeight: "600" }}>1. Student Submits</span>
                    <span>➔</span>
                    <span style={{ padding: "6px 12px", borderRadius: "20px", background: currentReviewStage === 'faculty' ? "#48bb78" : "#e2e8f0", color: currentReviewStage === 'faculty' ? "#fff" : "#333", fontWeight: "700" }}>
                        2. Faculty Approves
                    </span>
                    <span>➔</span>
                    <span style={{ padding: "6px 12px", borderRadius: "20px", background: currentReviewStage === 'hod' ? "#ed8936" : "#e2e8f0", color: currentReviewStage === 'hod' ? "#fff" : "#333", fontWeight: "700" }}>
                        3. HOD Approves
                    </span>
                    <span>➔</span>
                    <span style={{ padding: "6px 12px", borderRadius: "20px", background: currentReviewStage === 'director' ? "#9f7aea" : "#e2e8f0", color: currentReviewStage === 'director' ? "#fff" : "#333", fontWeight: "700" }}>
                        4. Director / Dean Sanction
                    </span>
                </div>
            </div>

            {/* If Admin, allow switching stage tabs */}
            {user.role === 'admin' && (
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                    <button
                        type="button"
                        style={{ background: stageTab === 'faculty' ? "#48bb78" : "#cbd5e0", color: "#fff" }}
                        onClick={() => setStageTab('faculty')}
                    >
                        Stage 1: Faculty Queue
                    </button>
                    <button
                        type="button"
                        style={{ background: stageTab === 'hod' ? "#ed8936" : "#cbd5e0", color: "#fff" }}
                        onClick={() => setStageTab('hod')}
                    >
                        Stage 2: HOD Queue
                    </button>
                    <button
                        type="button"
                        style={{ background: stageTab === 'director' ? "#9f7aea" : "#cbd5e0", color: "#fff" }}
                        onClick={() => setStageTab('director')}
                    >
                        Stage 3: Director Queue
                    </button>
                </div>
            )}

            <div style={{ background: "#e6fffa", borderLeft: "4px solid #319795", padding: "12px", marginBottom: "20px", borderRadius: "4px" }}>
                <strong>{stageTitles[currentReviewStage]}</strong>
                <div style={{ fontSize: "12px", color: "#234e52", marginTop: "4px" }}>
                    {nextStepInfo[currentReviewStage]}
                </div>
            </div>

            {/* ==================== 1. EVENTS QUEUE ==================== */}
            <h2 style={{ marginTop: "20px", color: "#007bff" }}>
                1. Pending Club Event Proposals ({pendingEvents.length})
            </h2>
            <table>
                <thead>
                    <tr>
                        <th>Event Name</th>
                        <th>Club</th>
                        <th>Date & Venue</th>
                        <th>Submitted By</th>
                        <th>Current Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingEvents.map((ev) => (
                        <tr key={ev._id}>
                            <td><strong>{ev.event_name}</strong></td>
                            <td>{ev.club_name}</td>
                            <td>{ev.event_date} @ {ev.venue}</td>
                            <td>{ev.submittedBy || "Student"}</td>
                            <td>
                                <span className="badge-pending" style={{ textTransform: "uppercase" }}>{ev.status}</span>
                            </td>
                            <td>
                                <button
                                    type="button"
                                    disabled={loading}
                                    style={{ backgroundColor: "#28a745", marginRight: "6px" }}
                                    onClick={() => handleEventAction(ev._id, 'approve')}
                                >
                                    {currentReviewStage === 'director' ? "Grant Final Sanction" : "Approve & Forward"}
                                </button>
                                <button
                                    type="button"
                                    disabled={loading}
                                    style={{ backgroundColor: "#dc3545" }}
                                    onClick={() => handleEventAction(ev._id, 'reject')}
                                >
                                    Reject
                                </button>
                            </td>
                        </tr>
                    ))}
                    {pendingEvents.length === 0 && (
                        <tr>
                            <td colSpan="6" style={{ textAlign: "center", color: "#888", padding: "20px" }}>
                                No event proposals waiting at this stage.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* ==================== 2. OD REQUESTS QUEUE ==================== */}
            <h2 style={{ marginTop: "35px", color: "#28a745" }}>
                2. Pending Student OD Requests ({pendingOds.length})
            </h2>
            <table>
                <thead>
                    <tr>
                        <th>Student & Roll</th>
                        <th>Dept</th>
                        <th>Event Name</th>
                        <th>Duration</th>
                        <th>Reason</th>
                        <th>Current Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingOds.map((item) => (
                        <tr key={item._id}>
                            <td><strong>{item.student_name}</strong> ({item.roll_no})</td>
                            <td>{item.department}</td>
                            <td>{item.event_name}</td>
                            <td>{item.fromDate} to {item.toDate}</td>
                            <td style={{ fontSize: "12px", color: "#555" }}>{item.reason}</td>
                            <td>
                                <span className="badge-pending" style={{ textTransform: "uppercase" }}>{item.status}</span>
                            </td>
                            <td>
                                <button
                                    type="button"
                                    disabled={loading}
                                    style={{ backgroundColor: "#28a745", marginRight: "6px" }}
                                    onClick={() => handleOdAction(item._id, 'approve')}
                                >
                                    {currentReviewStage === 'director' ? "Grant Final Sanction" : "Approve & Forward"}
                                </button>
                                <button
                                    type="button"
                                    disabled={loading}
                                    style={{ backgroundColor: "#dc3545" }}
                                    onClick={() => handleOdAction(item._id, 'reject')}
                                >
                                    Reject
                                </button>
                            </td>
                        </tr>
                    ))}
                    {pendingOds.length === 0 && (
                        <tr>
                            <td colSpan="7" style={{ textAlign: "center", color: "#888", padding: "20px" }}>
                                No OD applications waiting at this stage.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default Approvals
