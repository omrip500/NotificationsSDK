import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import "./ApplicationPage.css";

function ApplicationPage() {
  const { appId } = useParams();
  const [activeTab, setActiveTab] = useState("send");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sendAt, setSendAt] = useState("");
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

  const [devices, setDevices] = useState([]);
  const [individualMessage, setIndividualMessage] = useState({});

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/applications/${appId}/interests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailableInterests(res.data.interests || []);
      } catch (err) {
        console.error("Failed to fetch interests", err);
      }
    };
    fetchInterests();
  }, [appId]);

  useEffect(() => {
    if (activeTab === "individual") {
      const fetchDevices = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await api.get(`/devices/app/${appId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setDevices(res.data);
        } catch (err) {
          console.error("Failed to fetch devices", err);
        }
      };
      fetchDevices();
    }
  }, [activeTab, appId]);

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

    const payload = { appId, title, body, filters };
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "x-api-key": localStorage.getItem("apiKey"),
    };

    try {
      if (sendAt && new Date(sendAt) > new Date()) {
        payload.sendAt = new Date(sendAt).toISOString();
        await api.post("/notifications/schedule", payload, { headers });
        setMessage("Notification scheduled successfully.");
      } else {
        await api.post("/notifications/send", payload, { headers });
        setMessage("Notification sent successfully.");
      }

      setTitle("");
      setBody("");
      setSendAt("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send/schedule notification."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (name) => {
    setShowFilter((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleInterestToggle = (value) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  };

  const handleIndividualChange = (token, field, value) => {
    setIndividualMessage((prev) => ({
      ...prev,
      [token]: {
        ...prev[token],
        [field]: value,
      },
    }));
  };

  const handleSendToUser = async (token) => {
    const { title, body, sendAt } = individualMessage[token] || {};
    if (!title || !body) return alert("Please enter title and body");

    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "x-api-key": localStorage.getItem("apiKey"),
    };

    const payload = {
      appId,
      title,
      body,
      tokens: [token],
    };

    try {
      if (sendAt && new Date(sendAt) > new Date()) {
        payload.sendAt = new Date(sendAt).toISOString();
        payload.filters = {};
        await api.post("/notifications/schedule", payload, { headers });
        alert("Notification scheduled!");
      } else {
        await api.post("/notifications/send-to-specific", payload, { headers });
        alert("Notification sent!");
      }

      setIndividualMessage((prev) => ({
        ...prev,
        [token]: { title: "", body: "", sendAt: "" },
      }));
    } catch (err) {
      alert("Failed to send notification");
      console.error(err);
    }
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
        <button
          className={activeTab === "individual" ? "active" : ""}
          onClick={() => setActiveTab("individual")}
        >
          Send to Individual
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

            <label>
              Send At (optional):
              <input
                type="datetime-local"
                value={sendAt}
                onChange={(e) => setSendAt(e.target.value)}
              />
            </label>

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
              {loading
                ? "Sending..."
                : sendAt
                ? "Schedule Notification"
                : "Send Notification"}
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

        {activeTab === "individual" && (
          <div className="device-list">
            {devices.length === 0 ? (
              <p>No devices found.</p>
            ) : (
              devices.map((device) => {
                const msg = individualMessage[device.token] || {};
                return (
                  <div key={device._id} className="device-card">
                    <p>
                      <strong>User ID:</strong> {device.userInfo?.userId}
                    </p>
                    <p>
                      <strong>Gender:</strong> {device.userInfo?.gender}
                    </p>
                    <p>
                      <strong>Age:</strong> {device.userInfo?.age}
                    </p>
                    <p>
                      <strong>Interests:</strong>{" "}
                      {device.userInfo?.interests?.join(", ")}
                    </p>

                    <input
                      type="text"
                      placeholder="Notification Title"
                      value={msg.title || ""}
                      onChange={(e) =>
                        handleIndividualChange(
                          device.token,
                          "title",
                          e.target.value
                        )
                      }
                    />
                    <textarea
                      placeholder="Notification Body"
                      value={msg.body || ""}
                      onChange={(e) =>
                        handleIndividualChange(
                          device.token,
                          "body",
                          e.target.value
                        )
                      }
                    />
                    <input
                      type="datetime-local"
                      value={msg.sendAt || ""}
                      onChange={(e) =>
                        handleIndividualChange(
                          device.token,
                          "sendAt",
                          e.target.value
                        )
                      }
                    />
                    <button onClick={() => handleSendToUser(device.token)}>
                      Send Notification
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationPage;
