import Header from "../components/Header"
import Footer from "../components/Footer"
import Home from "./pages/Home"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Register from "./pages/register"
import Login from "./pages/login"
import Events from "./pages/Events"
import OdApplication from "./pages/OdApplication"
import Approvals from "./pages/Approvals"
import { Routes, Route } from "react-router-dom"

function App() {
  return (
    <div>
      <Header />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/od" element={<OdApplication />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App
