function About() {
    return (
        <div className="page-container">
            <h1>About Us</h1>
            <p style={{ lineHeight: "1.6", color: "#444" }}>
                The Campus Club Event and On-Duty (OD) Approval Portal is designed to streamline extracurricular event proposals and official student leave management.
            </p>
            <ul style={{ marginTop: "15px", paddingLeft: "20px", lineHeight: "1.8", color: "#555" }}>
                <li><strong>Students:</strong> Propose technical and cultural club events, apply for ODs with dates and proof.</li>
                <li><strong>Faculty Advisors:</strong> Verify proposal viability and approve or reject submissions in real-time.</li>
                <li><strong>Administrators:</strong> Track institutional activity, view all events and student records.</li>
            </ul>
        </div>
    )
}

export default About
