import { Routes, Route, Link } from "react-router-dom"

function Home() {
  return <h2>Home</h2>
}
function Dashboard() {
  return <h2>Dashboard</h2>
}
function Reports() {
  return <h2>Reports</h2>
}

export default function App() {
  return (
    <div style={{ padding: 40, fontSize: 20 }}>
      <h1>🚀 CoreSight Frontend is Live</h1>

      <nav style={{ display: "flex", gap: 16, margin: "20px 0" }}>
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/reports">Reports</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </div>
  )
}
