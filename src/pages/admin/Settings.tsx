export default function Settings() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>Settings</h1>
      <p style={{ opacity: 0.8, marginTop: 8 }}>
        Platform settings will live here (base config, roles, integrations, etc.).
      </p>

      <div
        style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 12,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Coming soon</h3>
        <ul style={{ lineHeight: 1.8 }}>
          <li>Google Sheet integration status</li>
          <li>Default tenant plan & limits</li>
          <li>Roles & permissions</li>
          <li>Audit logs</li>
        </ul>
      </div>
    </div>
  )
}
