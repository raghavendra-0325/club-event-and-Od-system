import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Register() {
    let [name, setName] = useState("")
    let [email, setEmail] = useState("")
    let [password, setPassword] = useState("")
    let [role, setRole] = useState("student")
    let [loading, setLoading] = useState(false)
    let navigate = useNavigate()

    let handleRegister = async (event) => {
        event.preventDefault()
        setLoading(true)
        try {
            let res = await fetch('http://localhost:3000/api/student/register', {
                method: "POST",
                headers: { 'Content-Type': "application/json" },
                body: JSON.stringify({ name, email, password, role })
            })
            let data = await res.json()
            if (res.ok) {
                alert(`Account created successfully as ${role.toUpperCase()}! You can now log in.`)
                navigate("/login")
            } else {
                alert("Registration failed: " + (data.message || data.error || "Unknown error"))
            }
        } catch (err) {
            console.error("Registration error:", err)
            alert("Connection Error! Could not reach backend server at http://localhost:3000: " + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-container" style={{ maxWidth: "520px", margin: "40px auto" }}>
            <h1>Register Account</h1>
            <p style={{ color: "#666", marginBottom: "20px" }}>
                Create an institutional account as Student, Faculty Advisor, HOD, or Director.
            </p>

            <form onSubmit={handleRegister}>
                <label style={{ fontSize: "12px", fontWeight: "600" }}>Full Name</label>
                <input
                    type="text"
                    onChange={(event) => setName(event.target.value)}
                    value={name}
                    placeholder="e.g. Dr. K. Venkataraman or Aarav Sharma"
                    required
                />

                <label style={{ fontSize: "12px", fontWeight: "600" }}>Campus Email</label>
                <input
                    type="email"
                    onChange={(event) => setEmail(event.target.value)}
                    value={email}
                    placeholder="e.g. name@campus.edu"
                    required
                />

                <label style={{ fontSize: "12px", fontWeight: "600" }}>Password</label>
                <input
                    type="password"
                    onChange={(event) => setPassword(event.target.value)}
                    value={password}
                    placeholder="Enter password"
                    required
                />

                <label style={{ fontSize: "12px", fontWeight: "600" }}>Designated Role</label>
                <select onChange={(event) => setRole(event.target.value)} value={role} required>
                    <option value="student">Student (Submit Event proposals & OD leaves)</option>
                    <option value="faculty">Faculty Advisor (Stage 1 Verifier)</option>
                    <option value="hod">Head of Department - HOD (Stage 2 Academic Scrutiny)</option>
                    <option value="director">Director / Dean (Stage 3 Final Institutional Sanction)</option>
                </select>

                <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", marginTop: "10px" }}>
                    {loading ? "Registering..." : "Create Account"}
                </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "15px", fontSize: "13px" }}>
                Already registered? <a href="/login" style={{ color: "#0f3460", fontWeight: "600" }}>Login here</a>
            </div>
        </div>
    )
}

export default Register
