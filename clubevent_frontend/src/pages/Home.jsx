import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

function Home() {
    let [stats, setStats] = useState({
        totalEvents: 0,
        pendingFacultyEvents: 0,
        pendingHodEvents: 0,
        pendingDirectorEvents: 0,
        approvedEvents: 0,
        totalOds: 0,
        pendingFacultyOds: 0,
        pendingHodOds: 0,
        pendingDirectorOds: 0,
        approvedOds: 0
    })

    const storedUser = JSON.parse(localStorage.getItem("user") || "null")

    useEffect(() => {
        fetch('http://localhost:3000/api/admin/stats')
            .then(res => {
                if (res.ok) return res.json()
                throw new Error("Stats not available")
            })
            .then(data => setStats(data))
            .catch(err => console.log("Stats fetch note:", err.message))
    }, [])

    return (
        <div className="page-container">
            <h1>Campus Club Event & OD Approval Portal</h1>
            <p style={{ color: "#666", marginBottom: "25px" }}>
                Multi-tier Institutional Approval Workflow: Student Submits ➔ Faculty Approves ➔ HOD Endorses ➔ Director/Dean Final Sanction
            </p>

            {/* User Session Banner */}
            {storedUser ? (
                <div style={{ background: "#e8f4fd", border: "1px solid #b8daff", padding: "14px 20px", borderRadius: "8px", marginBottom: "25px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <strong>Welcome back, {storedUser.name}!</strong>
                        <div style={{ fontSize: "12px", color: "#004085", marginTop: "3px" }}>
                            Logged in as: <strong style={{ textTransform: "uppercase" }}>{storedUser.role}</strong> ({storedUser.email})
                        </div>
                    </div>
                    {storedUser.role === 'student' ? (
                        <Link to="/events"><button type="button">Propose Event</button></Link>
                    ) : (
                        <Link to="/approvals"><button type="button" style={{ background: "#28a745" }}>Open Approval Queue</button></Link>
                    )}
                </div>
            ) : (
                <div style={{ background: "#fff3cd", border: "1px solid #ffeeba", padding: "14px 20px", borderRadius: "8px", marginBottom: "25px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <strong>You are not logged in.</strong>
                        <div style={{ fontSize: "12px", color: "#856404", marginTop: "3px" }}>
                            Please log in using your role (Student, Faculty Advisor, HOD, Director).
                        </div>
                    </div>
                    <Link to="/login"><button type="button" style={{ background: "#0f3460" }}>Login to Portal</button></Link>
                </div>
            )}

            {/* Approval Pipeline Counts Grid */}
            <h2 style={{ fontSize: "17px", color: "#2d3748", marginBottom: "14px" }}>Multi-Tier Approval Pipeline Overview</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" }}>
                <div style={{ background: "#f0fff4", padding: "16px", borderRadius: "8px", borderLeft: "5px solid #38a169" }}>
                    <div style={{ fontSize: "12px", color: "#276749", fontWeight: "700" }}>STAGE 1: FACULTY QUEUE</div>
                    <h2 style={{ color: "#2f855a", margin: "6px 0" }}>{(stats.pendingFacultyEvents || 0) + (stats.pendingFacultyOds || 0)}</h2>
                    <small style={{ color: "#48bb78" }}>{stats.pendingFacultyEvents || 0} Events • {stats.pendingFacultyOds || 0} ODs</small>
                </div>

                <div style={{ background: "#fffaf0", padding: "16px", borderRadius: "8px", borderLeft: "5px solid #dd6b20" }}>
                    <div style={{ fontSize: "12px", color: "#9c4221", fontWeight: "700" }}>STAGE 2: HOD QUEUE</div>
                    <h2 style={{ color: "#c05621", margin: "6px 0" }}>{(stats.pendingHodEvents || 0) + (stats.pendingHodOds || 0)}</h2>
                    <small style={{ color: "#ed8936" }}>{stats.pendingHodEvents || 0} Events • {stats.pendingHodOds || 0} ODs</small>
                </div>

                <div style={{ background: "#faf5ff", padding: "16px", borderRadius: "8px", borderLeft: "5px solid #805ad5" }}>
                    <div style={{ fontSize: "12px", color: "#553c9e", fontWeight: "700" }}>STAGE 3: DIRECTOR QUEUE</div>
                    <h2 style={{ color: "#6b46c1", margin: "6px 0" }}>{(stats.pendingDirectorEvents || 0) + (stats.pendingDirectorOds || 0)}</h2>
                    <small style={{ color: "#9f7aea" }}>{stats.pendingDirectorEvents || 0} Events • {stats.pendingDirectorOds || 0} ODs</small>
                </div>

                <div style={{ background: "#ebf8ff", padding: "16px", borderRadius: "8px", borderLeft: "5px solid #3182ce" }}>
                    <div style={{ fontSize: "12px", color: "#2b6cb0", fontWeight: "700" }}>OFFICIALLY SANCTIONED</div>
                    <h2 style={{ color: "#2b6cb0", margin: "6px 0" }}>{(stats.approvedEvents || 0) + (stats.approvedOds || 0)}</h2>
                    <small style={{ color: "#4299e1" }}>{stats.approvedEvents || 0} Events • {stats.approvedOds || 0} ODs</small>
                </div>
            </div>

            <h2>Access by Role</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", marginTop: "15px" }}>
                <div style={{ border: "1px solid #e2e8f0", padding: "15px", borderRadius: "6px" }}>
                    <h4>👨‍🎓 Student Role</h4>
                    <p style={{ fontSize: "12.5px", color: "#666", margin: "6px 0 12px" }}>
                        Can submit Club Event proposals and academic OD applications. Cannot access Approvals.
                    </p>
                    <Link to="/events"><button type="button" style={{ fontSize: "12px", padding: "6px 12px" }}>Open Student Portal</button></Link>
                </div>

                <div style={{ border: "1px solid #e2e8f0", padding: "15px", borderRadius: "6px" }}>
                    <h4>👨‍🏫 Faculty Role</h4>
                    <p style={{ fontSize: "12.5px", color: "#666", margin: "6px 0 12px" }}>
                        Level 1 Verification. Reviews initial student proposals and forwards approved items to HOD.
                    </p>
                    <Link to="/approvals"><button type="button" style={{ fontSize: "12px", padding: "6px 12px", background: "#38a169" }}>Open Faculty Queue</button></Link>
                </div>

                <div style={{ border: "1px solid #e2e8f0", padding: "15px", borderRadius: "6px" }}>
                    <h4>👔 HOD (Admin) Role</h4>
                    <p style={{ fontSize: "12.5px", color: "#666", margin: "6px 0 12px" }}>
                        Level 2 Scrutiny. Endorses applications approved by faculty and forwards to Director.
                    </p>
                    <Link to="/approvals"><button type="button" style={{ fontSize: "12px", padding: "6px 12px", background: "#dd6b20" }}>Open HOD Queue</button></Link>
                </div>

                <div style={{ border: "1px solid #e2e8f0", padding: "15px", borderRadius: "6px" }}>
                    <h4>🏛️ Director / Dean Role</h4>
                    <p style={{ fontSize: "12.5px", color: "#666", margin: "6px 0 12px" }}>
                        Level 3 Final Sanction. Approves venue, budget, and issues official college OD attendance.
                    </p>
                    <Link to="/approvals"><button type="button" style={{ fontSize: "12px", padding: "6px 12px", background: "#805ad5" }}>Open Director Queue</button></Link>
                </div>
            </div>
        </div>
    )
}

export default Home
