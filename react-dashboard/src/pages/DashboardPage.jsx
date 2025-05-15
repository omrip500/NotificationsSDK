import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./DashboardPage.css";

const allInterests = [
  "Sports",
  "Politics",
  "Tech",
  "Beauty",
  "Health",
  "Food",
  "Finance",
  "Education",
];

function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [name, setName] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/applications/my-apps", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setApplications(res.data);
    } catch (err) {
      setError("Failed to fetch applications.");
    }
  };

  const handleCheckboxChange = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/applications/create",
        { name, interests: selectedInterests },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setName("");
      setSelectedInterests([]);
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create application.");
    } finally {
      setLoading(false);
    }
  };

  const handleAppClick = (appId) => {
    navigate(`/apps/${appId}`);
  };

  React.useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>My Applications</h2>
        <form onSubmit={handleCreate} className="create-form">
          <input
            type="text"
            placeholder="New App Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className="interests-label">Choose Interests:</label>
          <div className="checkbox-list">
            {allInterests.map((interest) => (
              <label key={interest} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedInterests.includes(interest)}
                  onChange={() => handleCheckboxChange(interest)}
                />
                {interest}
              </label>
            ))}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="applications-list">
        {applications.map((app) => (
          <div
            key={app._id}
            className="app-card clickable"
            onClick={() => handleAppClick(app._id)}
          >
            <h3>{app.name}</h3>
            <p>App ID: {app._id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
