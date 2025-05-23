import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import UserAnalyticsPanel from "./UserAnalyticsPanel";
import "./AnalyticsPerUserTab.css";

function AnalyticsPerUserTab() {
  const { appId } = useParams();
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/stats/per-user/${appId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch per-user analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [appId]);

  if (loading) return <p>Loading user analytics...</p>;

  if (selectedUser) {
    return (
      <div>
        <button className="back-button" onClick={() => setSelectedUser(null)}>
          ← Back to Users Table
        </button>
        <UserAnalyticsPanel user={selectedUser} />
      </div>
    );
  }

  return (
    <div className="user-stats-table">
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Interests</th>
            <th># Notifications</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index} onClick={() => setSelectedUser(user)}>
              <td>{user.userId}</td>
              <td>{user.gender}</td>
              <td>{user.age}</td>
              <td>{user.interests.join(", ")}</td>
              <td>{user.notifications}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AnalyticsPerUserTab;
