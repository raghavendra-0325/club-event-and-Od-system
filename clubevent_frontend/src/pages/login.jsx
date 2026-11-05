import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {
    let [selectedRole, setSelectedRole] = useState("student")
    let [email, setEmail] = useState("student@campus.edu")
    let [password, setPassword] = useState("123456")
    let [loading, setLoading] = useState(false)
    let navigate = useNavigate()

    const demoCredentials = {
        student: { email: "student@campus.edu", pass: "123456", title: "Student Portal" },
        faculty: { email: "faculty@campus.edu", pass: "123456", title: "Faculty Advisor Portal (Stage 1)" },
        hod: { email: "hod@campus.edu", pass: "123456", title: "Head of Dept (HOD) Portal (Stage 2)" },
        director: { email: "director@campus.edu", pass: "123456", title: "Director / Dean Portal (Stage 3 Final)" }
    }

    const switchRoleTab = (roleKey) => {
        setSelectedRole(roleKey)
        setEmail(demoCredentials[roleKey].email)
        setPassword(demoCredentials[roleKey].pass)
    }

    let handleLogin = async (event) => {
        event.preventDefault()
        setLoading(true)
        try {
            let res = await fetch('http://localhost:3000/api/student/login', {
                method: "POST",
                headers: { 'Content-Type': "application/json" },
                body: JSON.stringify({ email, password, role: selectedRole })
            })
            let data = await res.json()
            if (res.ok) {
                localStorage.setItem("user", JSON.stringify(data.user))
                alert(`Login Successful! Welcome, ${data.user.name} (${data.user.role.toUpperCase()})`)

                // Redirect based on role
                if (data.user.role === 'student') {
                    navigate('/events')
                } else {
                    navigate('/approvals')
                }
            } else {
                alert("Login Failed: " + (data.message || "Invalid email or password"))
            }
        } catch (err) {
            console.error("Login error:", err)
            alert("Connection Error! Could not reach backend server at http://localhost:3000: " + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-container" style={{ maxWidth: "580px", margin: "40px auto" }}>
            <h1 style={{ textAlign: "center" }}>Role-Based Portal Login</h1>
            <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
                Select your designated role to log into your portal.
            </p>

            {/* Role Navigation Tabs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "20px" }}>
                <button
                    type="button"
                    style={{
                        background: selectedRole === 'student' ? "#0f3460" : "#e2e8f0",
                        color: selectedRole === 'student' ? "#fff" : "#333",
                        padding: "8px 4px",
                        fontSize: "12px"
                    }}
                    onClick={() => switchRoleTab('student')}
                >
                    👨‍🎓 Student
                </button>
                <button
                    type="button"
                    style={{
                        background: selectedRole === 'faculty' ? "#0f3460" : "#e2e8f0",
                        color: selectedRole === 'faculty' ? "#fff" : "#333",
                        padding: "8px 4px",
                        fontSize: "12px"
                    }}
                    onClick={() => switchRoleTab('faculty')}
                >
                    👨‍🏫 Faculty
                </button>
                <button
                    type="button"
                    style={{
                        background: selectedRole === 'hod' ? "#0f3460" : "#e2e8f0",
                        color: selectedRole === 'hod' ? "#fff" : "#333",
                        padding: "8px 4px",
                        fontSize: "12px"
                    }}
                    onClick={() => switchRoleTab('hod')}
                >
                    👔 HOD
                </button>
                <button
                    type="button"
                    style={{
                        background: selectedRole === 'director' ? "#0f3460" : "#e2e8f0",
                        color: selectedRole === 'director' ? "#fff" : "#333",
                        padding: "8px 4px",
                        fontSize: "12px"
                    }}
                    onClick={() => switchRoleTab('director')}
                >
                    🏛️ Director
                </button>
            </div>

            <div style={{ background: "#f0f4f8", padding: "12px", borderRadius: "6px", marginBottom: "15px", border: "1px solid #d0dbe5" }}>
                <strong style={{ color: "#0f3460" }}>{demoCredentials[selectedRole].title}</strong>
                <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>
                    Demo Credentials loaded: <code>{demoCredentials[selectedRole].email}</code> / <code>123456</code>
                </div>
            </div>

            <form onSubmit={handleLogin}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#333" }}>Email Address</label>
                <input
                    type="email"
                    onChange={(event) => setEmail(event.target.value)}
                    value={email}
                    placeholder="Enter email address"
                    required
                />

                <label style={{ fontSize: "12px", fontWeight: "600", color: "#333" }}>Password</label>
                <input
                    type="password"
                    onChange={(event) => setPassword(event.target.value)}
                    value={password}
                    placeholder="Enter password"
                    required
                />

                <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", marginTop: "10px" }}>
                    {loading ? "Logging in..." : `Login as ${selectedRole.toUpperCase()}`}
                </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "15px", fontSize: "13px" }}>
                Don't have an account? <a href="/register" style={{ color: "#0f3460", fontWeight: "600" }}>Register here</a>
            </div>
        </div>
    )
}

export default Login
