import { useEffect, useState } from "react";
import API from "../../../API/api";

export default function AgentDashboard() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    API.get("/analytics/agent-performance").then(res => {
      setAgents(res.data);
    });
  }, []);

  // 🔥 group by department
  const grouped = agents.reduce((acc, agent) => {
    const dept = agent.department || "No Department";
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(agent);
    return acc;
  }, {});

  // ⏱️ format time
  const formatTime = (sec) => {
    if (!sec) return "—";
    if (sec < 60) return `${sec}s`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m ${sec % 60}s`;
    return `${Math.floor(sec / 3600)}h`;
  };

  // 🎯 color based on performance
  const getColor = (sec) => {
    if (!sec) return "#999";
    if (sec < 60) return "#22c55e"; // green
    if (sec < 180) return "#f59e0b"; // orange
    return "#ef4444"; // red
  };

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: "20px" }}>📊 Agent Performance</h2>

      {Object.entries(grouped).map(([dept, users]) => {
        // 🔥 sort best agents first
        const sorted = [...users].sort(
          (a, b) => a.avg_response_time - b.avg_response_time
        );

        return (
          <div
            key={dept}
            style={{
              marginBottom: "30px",
              border: "1px solid #eee",
              borderRadius: "12px",
              padding: "16px",
              background: "#fafafa",
            }}
          >
            <h3 style={{ marginBottom: "12px" }}>🏢 {dept}</h3>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "white",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <thead style={{ background: "#f3f4f6" }}>
                <tr>
                  <th style={th}>#</th>
                  <th style={th}>Name</th>
                  <th style={th}>Role</th>
                  <th style={th}>Country</th>
                  <th style={th}>Messages</th>
                  <th style={th}>Closed</th>
                  <th style={th}>Avg Response</th>
                  <th style={th}>First Response</th>
                </tr>
              </thead>

              <tbody>
                {sorted.map((u, i) => (
                  <tr key={u.id} style={{ borderTop: "1px solid #eee" }}>
                    <td style={td}>#{i + 1}</td>

                    <td style={td}>{u.name}</td>

                    <td style={td}>
                      {u.role === "admin"
                        ? "🧑‍💼 Admin"
                        : u.role === "support"
                        ? "👨‍💻 Support"
                        : "👑 Superadmin"}
                    </td>

                    <td style={td}>{u.country || "—"}</td>

                    <td style={td}>{u.message_count}</td>

                    <td style={td}>{u.conversations_closed}</td>

                    {/* ⏱️ AVG RESPONSE */}
                    <td
                      style={{
                        ...td,
                        color: getColor(u.avg_response_time),
                        fontWeight: "bold",
                      }}
                    >
                      {formatTime(u.avg_response_time)}
                    </td>

                    {/* ⚡ FIRST RESPONSE */}
                    <td
                      style={{
                        ...td,
                        color: getColor(u.first_response_time),
                        fontWeight: "bold",
                      }}
                    >
                      {formatTime(u.first_response_time)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

// 🎨 styles
const th = {
  padding: "10px",
  textAlign: "left",
  fontSize: "14px",
  fontWeight: "600",
};

const td = {
  padding: "10px",
  fontSize: "14px",
};