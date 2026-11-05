import { Link, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import './Header.css'

function Header() {
    const [user, setUser] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch (e) {
                setUser(null)
            }
        } else {
            setUser(null)
        }
    }, [location])

    const handleLogout = () => {
        localStorage.removeItem("user")
        setUser(null)
        alert("You have been logged out.")
        navigate("/login")
    }

    const roleEmoji = {
        student: "👨‍🎓",
        faculty: "👨‍🏫",
        hod: "👔",
        director: "🏛️",
        admin: "⚙️"
    }

    return (
        <div className="header">
            <span className="brand-title">🎓 Campus Club & OD System</span>

            <Link to="/">Home</Link>

            {/* Student Navigation */}
            {user && user.role === 'student' && (
                <>
                    <Link to="/events">Club Events</Link>
                    <Link to="/od">OD Application</Link>
                </>
            )}

            {/* Faculty Navigation (Stage 1) */}
            {user && user.role === 'faculty' && (
                <>
                    <Link to="/approvals" style={{ color: "#48bb78", fontWeight: "700" }}>
                        Faculty Approvals (Stage 1)
                    </Link>
                    <Link to="/events">View Events</Link>
                    <Link to="/od">View ODs</Link>
                </>
            )}

            {/* HOD Navigation (Stage 2) */}
            {user && user.role === 'hod' && (
                <>
                    <Link to="/approvals" style={{ color: "#ed8936", fontWeight: "700" }}>
                        HOD Approvals (Stage 2)
                    </Link>
                    <Link to="/events">View Events</Link>
                    <Link to="/od">View ODs</Link>
                </>
            )}

            {/* Director / Dean Navigation (Stage 3) */}
            {user && user.role === 'director' && (
                <>
                    <Link to="/approvals" style={{ color: "#9f7aea", fontWeight: "700" }}>
                        Director/Dean Sanction (Stage 3)
                    </Link>
                    <Link to="/events">View Events</Link>
                    <Link to="/od">View ODs</Link>
                </>
            )}

            {/* Admin Navigation */}
            {user && user.role === 'admin' && (
                <>
                    <Link to="/approvals" style={{ color: "#e94560", fontWeight: "700" }}>
                        All Approvals (Stages 1-3)
                    </Link>
                    <Link to="/events">View Events</Link>
                    <Link to="/od">View ODs</Link>
                </>
            )}

            {/* Public links */}
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>

            {/* Auth area */}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
                {user ? (
                    <>
                        <div className="user-badge">
                            <span>{roleEmoji[user.role] || "👤"} {user.name}</span>
                            <span className="role-pill">{user.role}</span>
                        </div>
                        <button className="btn-logout" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ background: "#0f3460" }}>Login</Link>
                        <Link to="/register" style={{ background: "#e94560" }}>Register</Link>
                    </>
                )}
            </div>
        </div>
    )
}

export default Header
