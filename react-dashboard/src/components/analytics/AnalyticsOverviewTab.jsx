import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../services/api";
import "./AnalyticsOverviewTab.css";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#facc15", "#a855f7"];

function AnalyticsOverviewTab({ appId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/stats/overview/${appId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch analytics", err);
      }
    };

    fetchStats();
  }, [appId]);

  if (!data) return <p>Loading analytics...</p>;

  return (
    <div className="overview-grid">
      <div className="card">
        <h4>Notifications per Day</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.perDay}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h4>Gender Distribution</h4>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={[
                { name: "Male", value: data.genderDistribution.male },
                { name: "Female", value: data.genderDistribution.female },
              ]}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={60}
              label
            >
              <Cell fill="#3b82f6" />
              <Cell fill="#ef4444" />
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h4>Interests Breakdown</h4>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data.interests}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={60}
              label
            >
              {data.interests.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h4>Total Notifications</h4>
        <p style={{ fontSize: "2rem", marginTop: "1rem" }}>{data.total}</p>
      </div>
    </div>
  );
}

export default AnalyticsOverviewTab;
