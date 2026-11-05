import { useState, useEffect } from "react"

function Events() {
    let [event_name, setEventName] = useState("")
    let [club_name, setClubName] = useState("")
    let [event_date, setEventDate] = useState("")
    let [venue, setVenue] = useState("")
    let [event_desc, setEventDesc] = useState("")
    let [eventsList, setEventsList] = useState([])
    let [loading, setLoading] = useState(false)

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}")

    let loadEvents = async () => {
        try {
            let res = await fetch('http://localhost:3000/api/student/viewevents')
            if (!res.ok) {
                console.error("Server responded with error status:", res.status)
                return
            }
            let data = await res.json()
            setEventsList(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Failed to fetch events from backend:", err)
        }
    }

    useEffect(() => {
        loadEvents()
    }, [])

    let handleEventSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            let res = await fetch('http://localhost:3000/api/student/apply-event', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_name,
                    club_name,
                    event_date,
                    venue,
                    event_desc,
                    submittedBy: storedUser.name || "Student Organizer"
                })
            })
            let data = await res.json()
            if (res.ok) {
                alert("Event proposal submitted successfully! It has been forwarded to Stage 1 (Faculty Advisor) for review.")
                setEventName("")
                setClubName("")
                setEventDate("")
                setVenue("")
                setEventDesc("")
                await loadEvents()
            } else {
                alert("Submission failed: " + (data.error || data.message || "Unknown error"))
            }
        } catch (err) {
            console.error("Error submitting event:", err)
            alert("Connection Error! Could not reach backend server at http://localhost:3000: " + err.message)
        } finally {
            setLoading(false)
        }
    }

    let handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this event proposal?")) return
        try {
            let res = await fetch(`http://localhost:3000/api/student/delete-event/${id}`, { method: "DELETE" })
            if (res.ok) {
                alert("Event proposal deleted successfully!")
                loadEvents()
            } else {
                alert("Failed to delete event proposal")
            }
        } catch (err) {
            console.error(err)
            alert("Error deleting event: " + err.message)
        }
    }

    const renderStageBadge = (ev) => {
        const s = (ev.status || '').toLowerCase()
        if (s === 'approved') return <span className="badge-approved">✓ SANCTIONED (Director)</span>
        if (s === 'rejected') return <span className="badge-rejected">✕ REJECTED</span>
        if (s === 'pending_director') return <span className="badge-pending" style={{ background: "#e9d8fd", color: "#6b46c1" }}>⏳ Stage 3: Awaiting Director</span>
        if (s === 'pending_hod') return <span className="badge-pending" style={{ background: "#feebc8", color: "#c05621" }}>⏳ Stage 2: Awaiting HOD</span>
        return <span className="badge-pending" style={{ background: "#c6f6d5", color: "#22543d" }}>⏳ Stage 1: Awaiting Faculty</span>
    }

    return (
        <div className="page-container">
            <h1>Club Event Proposals</h1>

            {/* Approval Cycle Notice */}
            <div style={{ background: "#edf2f7", padding: "12px 18px", borderRadius: "6px", marginBottom: "20px", fontSize: "13px", color: "#4a5568" }}>
                <strong>Multi-tier Approval Sequence:</strong> Student Submits ➔ Faculty Approves ➔ HOD Endorses ➔ Director/Dean Final Sanction
            </div>

            {/* Proposal Form: Available only for students or admins */}
            {(!storedUser.role || storedUser.role === 'student' || storedUser.role === 'admin') && (
                <form onSubmit={handleEventSubmit}>
                    <h3>+ Submit New Club Event Proposal</h3>
                    <input
                        type="text"
                        placeholder="Event Name (e.g. AI & Robotics Hackathon 2026)"
                        value={event_name}
                        onChange={(e) => setEventName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Club Name (e.g. Coding Club / Robotics Society)"
                        value={club_name}
                        onChange={(e) => setClubName(e.target.value)}
                        required
                    />
                    <input
                        type="date"
                        value={event_date}
                        onChange={(e) => setEventDate(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Venue / Auditorium"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        required
                    />
                    <textarea
                        rows="3"
                        placeholder="Event Description & Objectives"
                        value={event_desc}
                        onChange={(e) => setEventDesc(e.target.value)}
                        required
                    ></textarea>
                    <button type="submit" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Event Proposal"}
                    </button>
                </form>
            )}

            <h2>Track Club Event Proposals</h2>
            <table>
                <thead>
                    <tr>
                        <th>Event Name</th>
                        <th>Club</th>
                        <th>Date</th>
                        <th>Venue</th>
                        <th>Approval Stage & Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {eventsList.map((ev) => (
                        <tr key={ev._id}>
                            <td>
                                <strong>{ev.event_name}</strong>
                                <div style={{ fontSize: "11px", color: "#718096" }}>By: {ev.submittedBy || "Student"}</div>
                            </td>
                            <td>{ev.club_name}</td>
                            <td>{ev.event_date}</td>
                            <td>{ev.venue}</td>
                            <td>{renderStageBadge(ev)}</td>
                            <td>
                                <button
                                    type="button"
                                    style={{ backgroundColor: "#dc3545" }}
                                    onClick={() => handleDelete(ev._id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {eventsList.length === 0 && (
                        <tr>
                            <td colSpan="6" style={{ textAlign: "center", color: "#888", padding: "20px" }}>No event proposals found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default Events
