import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Send,
  BarChart3,
  History,
  User,
  Users,
  Search,
  Calendar,
  Filter,
  Trash2,
  Eye,
  Clock,
  Settings,
} from "lucide-react";
import api from "../services/api";
import SegmentManager from "../components/segments/SegmentManager";
import SegmentForm from "../components/segments/SegmentForm";
import StatisticsTab from "../components/analytics/StatisticsTab";
import ScheduledNotificationsTab from "../components/scheduled/ScheduledNotificationsTab";
import ServiceAccountManager from "../components/ServiceAccountManager";

function ApplicationPage() {
  const { appId } = useParams();
  const [activeTab, setActiveTab] = useState("send");
  const [appInfo, setAppInfo] = useState(null);

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
  });

  const [gender, setGender] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [interests, setInterests] = useState([]);
  const [availableInterests, setAvailableInterests] = useState([]);

  const [devices, setDevices] = useState([]);
  const [individualMessage, setIndividualMessage] = useState({});
  const [notificationHistory, setNotificationHistory] = useState([]);

  const [segments, setSegments] = useState([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState("");

  // History search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });

  useEffect(() => {
    const fetchAppInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/applications/${appId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppInfo(res.data);
      } catch (err) {
        console.error("Failed to fetch app info", err);
      }
    };
    fetchAppInfo();
  }, [appId]);

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
          setDevices(res.data || []);
        } catch (err) {
          console.error("Failed to fetch devices", err);
        }
      };
      fetchDevices();
    }
  }, [activeTab, appId]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await api.get(`/notifications/history/app/${appId}`, {
          headers,
        });
        setNotificationHistory(res.data || []);
      } catch (err) {
        console.error("Failed to fetch notification history", err);
      }
    };

    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab, appId]);

  // Filter history based on search term and date
  useEffect(() => {
    let filtered = notificationHistory;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.body.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (dateFilter.from || dateFilter.to) {
      filtered = filtered.filter((log) => {
        const logDate = new Date(log.sentAt);
        const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
        const toDate = dateFilter.to
          ? new Date(dateFilter.to + "T23:59:59")
          : null;

        if (fromDate && logDate < fromDate) return false;
        if (toDate && logDate > toDate) return false;
        return true;
      });
    }

    setFilteredHistory(filtered);
  }, [notificationHistory, searchTerm, dateFilter]);

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/segments/${appId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSegments(res.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch segments", err);
      }
    };
    fetchSegments();
  }, [appId]);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    let filters = {};
    if (selectedSegmentId) {
      const selectedSegment = segments.find((s) => s._id === selectedSegmentId);
      if (
        selectedSegment &&
        selectedSegment.filters &&
        Object.keys(selectedSegment.filters).length > 0
      ) {
        filters = selectedSegment.filters;
      } else {
        setError("Selected segment has no filters.");
        setLoading(false);
        return;
      }
    } else {
      if (showFilter.gender && gender) filters.gender = gender;
      if (showFilter.age) {
        if (ageMin) filters.ageMin = Number(ageMin);
        if (ageMax) filters.ageMax = Number(ageMax);
      }
      if (showFilter.interests && interests.length > 0)
        filters.interests = interests;
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
      setGender("");
      setAgeMin("");
      setAgeMax("");
      setInterests([]);
      setShowFilter({
        gender: false,
        age: false,
        interests: false,
      });
      setSelectedSegmentId("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to send/schedule notification.";

      // הודעות שגיאה מיוחדות עבור service account
      if (
        errorMessage.includes("Service account not found") ||
        errorMessage.includes("ClientId is required") ||
        errorMessage.includes("Please upload your Firebase service account")
      ) {
        setError(
          `${errorMessage}\n\n⚠️ Please go to the "Firebase Settings" tab to upload your service account JSON file.`
        );
      } else {
        setError(errorMessage);
      }
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
      const errorMessage =
        err.response?.data?.message || "Failed to send notification";

      // הודעות שגיאה מיוחדות עבור service account
      if (
        errorMessage.includes("Service account not found") ||
        errorMessage.includes("ClientId is required") ||
        errorMessage.includes("Please upload your Firebase service account")
      ) {
        alert(
          `${errorMessage}\n\nPlease go to the "Firebase Settings" tab to upload your service account JSON file.`
        );
      } else {
        alert(errorMessage);
      }
      console.error(err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh the history
      const res = await api.get(`/notifications/history/app/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificationHistory(res.data || []);
    } catch (err) {
      alert("Failed to delete notification");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {appInfo?.name || "Application Management"}
          </h1>
          <p className="text-gray-600">
            App ID: {appId}{" "}
            {appInfo?.platform && `• Platform: ${appInfo.platform}`}
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "send", label: "Send Notification", icon: Send },
                { id: "scheduled", label: "Scheduled", icon: Clock },
                { id: "stats", label: "Statistics", icon: BarChart3 },
                { id: "history", label: "Sent Notifications", icon: History },
                { id: "individual", label: "Send to Individual", icon: User },
                { id: "segments", label: "Manage Segments", icon: Users },
                { id: "firebase", label: "Firebase Settings", icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        <div className="tab-content">
          {activeTab === "send" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <form className="card" onSubmit={handleSendNotification}>
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Send Notification
                  </h3>
                  <p className="text-sm text-gray-600">
                    Create and send notifications to your users
                  </p>
                </div>

                <div className="card-body space-y-6">
                  {/* Basic Notification Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Title
                      </label>
                      <input
                        type="text"
                        placeholder="Enter notification title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Body
                      </label>
                      <textarea
                        placeholder="Enter notification message"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="textarea"
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Send At (optional)
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="datetime-local"
                            value={sendAt}
                            onChange={(e) => setSendAt(e.target.value)}
                            className="input pl-10"
                          />
                        </div>
                      </div>

                      {segments.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Choose Saved Segment
                          </label>
                          <select
                            value={selectedSegmentId}
                            onChange={(e) =>
                              setSelectedSegmentId(e.target.value)
                            }
                            className="input"
                          >
                            <option value="">-- None --</option>
                            {segments.map((seg) => (
                              <option key={seg._id} value={seg._id}>
                                {seg.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {!selectedSegmentId && (
                    <>
                      <div className="border-t pt-6">
                        <h4 className="text-md font-medium text-gray-900 mb-4">
                          Optional Filters
                        </h4>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          {Object.keys(showFilter).map((filter) => (
                            <label
                              key={filter}
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={showFilter[filter]}
                                onChange={() => toggleFilter(filter)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {filter.charAt(0).toUpperCase() +
                                  filter.slice(1)}
                              </span>
                            </label>
                          ))}
                        </div>

                        <div className="space-y-4">
                          {showFilter.gender && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gender
                              </label>
                              <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="input"
                              >
                                <option value="">Any</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                              </select>
                            </div>
                          )}

                          {showFilter.age && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Age Min
                                </label>
                                <input
                                  type="number"
                                  value={ageMin}
                                  onChange={(e) => setAgeMin(e.target.value)}
                                  className="input"
                                  placeholder="Minimum age"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Age Max
                                </label>
                                <input
                                  type="number"
                                  value={ageMax}
                                  onChange={(e) => setAgeMax(e.target.value)}
                                  className="input"
                                  placeholder="Maximum age"
                                />
                              </div>
                            </div>
                          )}

                          {showFilter.interests && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Interests
                              </label>
                              {availableInterests.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                  Loading interests...
                                </p>
                              ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                  {availableInterests.map((interest) => (
                                    <label
                                      key={interest}
                                      className="flex items-center space-x-2 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        value={interest}
                                        checked={interests.includes(interest)}
                                        onChange={() =>
                                          handleInterestToggle(interest)
                                        }
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                      />
                                      <span className="text-sm text-gray-700">
                                        {interest}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="card-footer">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      {message && (
                        <p className="text-sm text-success-600">{message}</p>
                      )}
                      {error && (
                        <p className="text-sm text-error-600">{error}</p>
                      )}
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {loading
                        ? "Sending..."
                        : sendAt
                        ? "Schedule Notification"
                        : "Send Notification"}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === "scheduled" && (
            <ScheduledNotificationsTab appId={appId} />
          )}

          {activeTab === "stats" && <StatisticsTab appId={appId} />}

          {activeTab === "history" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Search and Filter Bar */}
              <div className="card">
                <div className="card-body">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Search notifications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {filteredHistory.length} of{" "}
                          {notificationHistory.length} notifications
                        </span>
                      </div>
                    </div>

                    {/* Date Filter */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          From Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="date"
                            value={dateFilter.from}
                            onChange={(e) =>
                              setDateFilter({
                                ...dateFilter,
                                from: e.target.value,
                              })
                            }
                            className="input pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          To Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="date"
                            value={dateFilter.to}
                            onChange={(e) =>
                              setDateFilter({
                                ...dateFilter,
                                to: e.target.value,
                              })
                            }
                            className="input pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    {(dateFilter.from || dateFilter.to) && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => setDateFilter({ from: "", to: "" })}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Clear date filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {notificationHistory.length === 0
                      ? "No notifications sent yet"
                      : "No notifications match your search"}
                  </h3>
                  <p className="text-gray-600">
                    {notificationHistory.length === 0
                      ? "Notifications you send will appear here"
                      : "Try adjusting your search terms"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHistory.map((log, index) => (
                    <motion.div
                      key={log._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="card group hover:shadow-medium transition-all duration-300"
                    >
                      <div className="card-body">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-primary-100 rounded-lg">
                                <Send className="w-4 h-4 text-primary-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {log.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Clock className="w-4 h-4" />
                                  {new Date(log.sentAt).toLocaleString()}
                                </div>
                              </div>
                            </div>

                            <p className="text-gray-700 mb-4">{log.body}</p>

                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`badge ${
                                  log.type === "broadcast"
                                    ? "badge-primary"
                                    : "badge-success"
                                }`}
                              >
                                {log.type}
                              </span>

                              {log.type === "broadcast" &&
                                log.filters &&
                                Object.keys(log.filters).length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(log.filters).map(
                                      ([key, val]) => (
                                        <span
                                          key={key}
                                          className="badge badge-warning"
                                        >
                                          {key}:{" "}
                                          {Array.isArray(val)
                                            ? val.join(", ")
                                            : val.toString()}
                                        </span>
                                      )
                                    )}
                                  </div>
                                )}

                              {log.type === "individual" && log.token && (
                                <span className="badge badge-success">
                                  Individual: {log.token.substring(0, 8)}...
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => {
                                /* Add view details functionality */
                              }}
                              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNotification(log._id)}
                              className="p-2 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                              title="Delete Notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "individual" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {devices.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No devices found
                  </h3>
                  <p className="text-gray-600">
                    No registered devices for this application
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {devices.map((device, index) => {
                    const msg = individualMessage[device.token] || {};
                    return (
                      <motion.div
                        key={device._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="card"
                      >
                        <div className="card-header">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-100 rounded-lg">
                              <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                User: {device.userInfo?.userId || "Unknown"}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Device: {device.token.substring(0, 12)}...
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="card-body space-y-4">
                          {/* User Info */}
                          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                              <span className="text-sm font-medium text-gray-700">
                                Gender:
                              </span>
                              <p className="text-sm text-gray-900">
                                {device.userInfo?.gender || "N/A"}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700">
                                Age:
                              </span>
                              <p className="text-sm text-gray-900">
                                {device.userInfo?.age || "N/A"}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-sm font-medium text-gray-700">
                                Interests:
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {device.userInfo?.interests?.length > 0 ? (
                                  device.userInfo.interests.map(
                                    (interest, idx) => (
                                      <span
                                        key={idx}
                                        className="badge badge-primary"
                                      >
                                        {interest}
                                      </span>
                                    )
                                  )
                                ) : (
                                  <span className="text-sm text-gray-500">
                                    No interests
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Notification Form */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notification Title
                              </label>
                              <input
                                type="text"
                                placeholder="Enter notification title"
                                value={msg.title || ""}
                                onChange={(e) =>
                                  handleIndividualChange(
                                    device.token,
                                    "title",
                                    e.target.value
                                  )
                                }
                                className="input"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notification Body
                              </label>
                              <textarea
                                placeholder="Enter notification message"
                                value={msg.body || ""}
                                onChange={(e) =>
                                  handleIndividualChange(
                                    device.token,
                                    "body",
                                    e.target.value
                                  )
                                }
                                className="textarea"
                                rows={3}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Schedule (Optional)
                              </label>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                                  className="input pl-10"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="card-footer">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSendToUser(device.token)}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                            disabled={!msg.title || !msg.body}
                          >
                            <Send className="w-4 h-4" />
                            {msg.sendAt && new Date(msg.sendAt) > new Date()
                              ? "Schedule Notification"
                              : "Send Notification"}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "segments" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <SegmentForm
                appId={appId}
                onSegmentCreated={async () => {
                  const token = localStorage.getItem("token");
                  const res = await api.get(`/segments/${appId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  setSegments(res.data || []);
                }}
              />
              <SegmentManager
                appId={appId}
                onSegmentsChange={async () => {
                  const token = localStorage.getItem("token");
                  const res = await api.get(`/segments/${appId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  setSegments(res.data || []);
                }}
              />
            </motion.div>
          )}

          {activeTab === "firebase" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <ServiceAccountManager appId={appId} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApplicationPage;
