// src/pages/ApplicationPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import "./ApplicationPage.css";

function ApplicationPage() {
  const { appId } = useParams();
  const [activeTab, setActiveTab] = useState("send");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showFilter, setShowFilter] = useState({
    gender: false,
    age: false,
    interests: false,
    location: false,
  });

  const [gender, setGender] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [interests, setInterests] = useState([]);
  const [availableInterests, setAvailableInterests] = useState([]);
  const [location, setLocation] = useState({ lat: "", lng: "", radiusKm: "" });

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/applications/${appId}/interests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAvailableInterests(res.data.interests || []);
      } catch (err) {
        console.error("Failed to fetch interests", err);
      }
    };

    fetchInterests();
  }, [appId]);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const filters = {};

    if (showFilter.gender && gender) filters.gender = gender;
    if (showFilter.age) {
      if (ageMin) filters.ageMin = Number(ageMin);
      if (ageMax) filters.ageMax = Number(ageMax);
    }
    if (showFilter.interests && interests.length > 0)
      filters.interests = interests;
    if (
      showFilter.location &&
      location.lat &&
      location.lng &&
      location.radiusKm
    ) {
      filters.location = {
        lat: Number(location.lat),
        lng: Number(location.lng),
        radiusKm: Number(location.radiusKm),
      };
    }

    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/notifications/send`,
        { appId, title, body, filters },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-api-key": localStorage.getItem("apiKey"),
          },
        }
      );
      setMessage("Notification sent successfully.");
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send notification.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (name) => {
    setShowFilter((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleInterestToggle = (value) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  };

  return (
    <div className="app-page-container">
      <h2>Manage Application: {appId}</h2>

      <div className="tabs">
        <button
          className={activeTab === "send" ? "active" : ""}
          onClick={() => setActiveTab("send")}
        >
          Send Notification
        </button>
        <button
          className={activeTab === "stats" ? "active" : ""}
          onClick={() => setActiveTab("stats")}
        >
          Statistics
        </button>
        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          Sent Notifications
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "send" && (
          <form className="send-form" onSubmit={handleSendNotification}>
            <input
              type="text"
              placeholder="Notification Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Notification Body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />

            <hr />
            <h4>Optional Filters</h4>
            <div className="filter-checkboxes">
              {Object.keys(showFilter).map((filter) => (
                <label key={filter}>
                  <span>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </span>
                  <input
                    type="checkbox"
                    checked={showFilter[filter]}
                    onChange={() => toggleFilter(filter)}
                  />
                </label>
              ))}
            </div>

            {showFilter.gender && (
              <label>
                Gender:
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>
            )}

            {showFilter.age && (
              <>
                <label>
                  Age Min:
                  <input
                    type="number"
                    value={ageMin}
                    onChange={(e) => setAgeMin(e.target.value)}
                  />
                </label>
                <label>
                  Age Max:
                  <input
                    type="number"
                    value={ageMax}
                    onChange={(e) => setAgeMax(e.target.value)}
                  />
                </label>
              </>
            )}

            {showFilter.interests && (
              <div className="checkbox-list">
                <span>Interests:</span>
                {availableInterests.length === 0 ? (
                  <p>Loading...</p>
                ) : (
                  availableInterests.map((interest) => (
                    <label key={interest} className="checkbox-item">
                      <input
                        type="checkbox"
                        value={interest}
                        checked={interests.includes(interest)}
                        onChange={() => handleInterestToggle(interest)}
                      />
                      {interest}
                    </label>
                  ))
                )}
              </div>
            )}

            {showFilter.location && (
              <label>
                Location:
                <div className="location-inputs">
                  <input
                    type="number"
                    placeholder="Latitude"
                    step="0.0001"
                    value={location.lat}
                    onChange={(e) =>
                      setLocation({ ...location, lat: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Longitude"
                    step="0.0001"
                    value={location.lng}
                    onChange={(e) =>
                      setLocation({ ...location, lng: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Radius (km)"
                    step="0.1"
                    value={location.radiusKm}
                    onChange={(e) =>
                      setLocation({ ...location, radiusKm: e.target.value })
                    }
                  />
                </div>
              </label>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Notification"}
            </button>

            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
          </form>
        )}

        {activeTab === "stats" && (
          <p>Analytics & statistics will be shown here</p>
        )}
        {activeTab === "history" && (
          <p>List of previously sent notifications</p>
        )}
      </div>
    </div>
  );
}

export default ApplicationPage;
