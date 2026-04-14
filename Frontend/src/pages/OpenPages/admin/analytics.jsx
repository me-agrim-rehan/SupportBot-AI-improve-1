import { useEffect, useState } from "react";
import API from "../../../API/api";
import { useNavigate } from "react-router-dom";

export default function DepartmentOverview() {
  const [agents, setAgents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/analytics/agent-performance").then((res) => {
      setAgents(res.data);
    });
  }, []);

  // ❌ remove "No Department" (superadmin etc.)
  const validAgents = agents.filter(
    (a) => a.department && a.department !== "No Department",
  );

  // 🔥 group + aggregate per department
  const departments = Object.values(
    validAgents.reduce((acc, agent) => {
      const dept = agent.department;

      if (!acc[dept]) {
        acc[dept] = {
          name: dept,
          total_messages: 0,
          total_closed: 0,
          avg_response_sum: 0,
          first_response_sum: 0,
          count: 0,
        };
      }

      // 📩 totals
      acc[dept].total_messages += agent.message_count;
      acc[dept].total_closed += agent.conversations_closed;

      // ⏱️ only include active agents in avg
      if (agent.message_count > 0) {
        acc[dept].avg_response_sum += agent.avg_response_time;
        acc[dept].first_response_sum += agent.first_response_time;
        acc[dept].count += 1;
      }

      return acc;
    }, {}),
  ).map((d) => ({
    ...d,
    avg_response: d.count ? Math.round(d.avg_response_sum / d.count) : 0,
    first_response: d.count ? Math.round(d.first_response_sum / d.count) : 0,
  }));

  const formatTime = (sec) => {
    if (!sec) return "—";
    if (sec < 60) return `${sec}s`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m`;
    return `${Math.floor(sec / 3600)}h`;
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>📊 Department Overview</h2>

      <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
        {departments.map((d) => (
          <div
            key={d.name}
            onClick={() => navigate(`/analytics/departments/${d.name}`)}
            style={{
              padding: "16px",
              borderRadius: "12px",
              background: "white",
              border: "1px solid #eee",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <h3>🏢 {d.name}</h3>

            <p>📩 Messages: {d.total_messages}</p>
            <p>✅ Closed: {d.total_closed}</p>
            <p>⏱ Avg Response: {formatTime(d.avg_response)}</p>
            <p>⚡ First Response: {formatTime(d.first_response)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
