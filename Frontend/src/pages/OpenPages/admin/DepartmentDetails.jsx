import { useEffect, useState } from "react";
import API from "../../../API/api";
import { useParams } from "react-router-dom";

export default function DepartmentDetails() {
  const [agents, setAgents] = useState([]);
  const { name } = useParams();

  useEffect(() => {
    API.get("/analytics/agent-performance").then((res) => {
      setAgents(res.data);
    });
  }, []);

  // 🔥 filter by department
  const filtered = agents.filter(
    (a) => (a.department || "No Department") === name,
  );

  const sorted = [...filtered].sort(
    (a, b) => a.avg_response_time - b.avg_response_time,
  );

  const formatTime = (sec) => {
    if (!sec) return "—";
    if (sec < 60) return `${sec}s`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m ${sec % 60}s`;
    return `${Math.floor(sec / 3600)}h`;
  };

  const getColor = (sec) => {
    if (!sec) return "#999";
    if (sec < 60) return "#22c55e";
    if (sec < 180) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>🏢 {name} - Agents</h2>

      <table style={{ width: "100%", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Role</th>
            <th>Country</th>
            <th>Messages</th>
            <th>Closed</th>
            <th>Avg Response</th>
            <th>First Response</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((u, i) => (
            <tr key={u.id}>
              <td>#{i + 1}</td>
              <td>{u.name}</td>
              <td>{u.role}</td>
              <td>{u.country || "—"}</td>
              <td>{u.message_count}</td>
              <td>{u.conversations_closed}</td>

              <td style={{ color: getColor(u.avg_response_time) }}>
                {formatTime(u.avg_response_time)}
              </td>

              <td style={{ color: getColor(u.first_response_time) }}>
                {formatTime(u.first_response_time)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
