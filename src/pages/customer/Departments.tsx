import CustomerPageShell from "./CustomerPageShell"

export default function CustomerDepartments() {
  const departments = [
    { name: "Engineering", owner: "Priya" },
    { name: "Finance", owner: "Amir" },
    { name: "Operations", owner: "Lina" },
  ]

  return (
    <CustomerPageShell title="Departments" subtitle="Department level controls and visibility">
      <div className="cs-card" style={{ padding: 18 }}>
        <table className="cs-table">
          <thead>
            <tr>
              <th className="cs-th">Name</th>
              <th className="cs-th">Owner</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, idx) => (
              <tr key={dept.name} style={{ background: idx % 2 === 0 ? "var(--surface)" : "#181c23" }}>
                <td className="cs-td">{dept.name}</td>
                <td className="cs-td">{dept.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CustomerPageShell>
  )
}
