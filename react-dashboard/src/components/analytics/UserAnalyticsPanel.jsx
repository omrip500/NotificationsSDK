import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./UserAnalyticsPanel.css";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#facc15", "#a855f7"];

function UserAnalyticsPanel({ user }) {
  const interestData = user.interests.map((i) => ({ name: i, value: 1 }));

  return (
    <div className="user-analytics-panel">
      <h3 style={{ fontSize: "1.75rem", marginBottom: "8px" }}>
        Analytics for <span style={{ color: "#3b82f6" }}>{user.userId}</span>
      </h3>

      <p>Gender: {user.gender}</p>
      <p>Age: {user.age}</p>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h4>Notifications per Day</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={user.perDay}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-card">
          <h4>Interest Breakdown</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={interestData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label
              >
                {interestData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-card">
          <h4>Total Notifications</h4>
          <p style={{ fontSize: "2rem" }}>{user.notifications}</p>
        </div>
      </div>
    </div>
  );
}

export default UserAnalyticsPanel;
