import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Users,
  Send,
  RotateCcw,
  Eye,
  EyeOff,
  Target,
  AlertCircle,
  CheckCircle,
  Map,
  Navigation,
} from "lucide-react";
import api from "../../services/api";

function SimpleLocationTab({ appId }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState(null);
  const [showUsers, setShowUsers] = useState(true);
  const [notification, setNotification] = useState({
    title: "",
    body: "",
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  // Predefined areas in Israel for demo
  const predefinedAreas = [
    {
      name: "Tel Aviv Center",
      bounds: {
        north: 32.0853,
        south: 32.0553,
        east: 34.7818,
        west: 34.7518,
      },
    },
    {
      name: "Jerusalem Center",
      bounds: {
        north: 31.7857,
        south: 31.7557,
        east: 35.2007,
        west: 35.1707,
      },
    },
    {
      name: "Haifa Center",
      bounds: {
        north: 32.8157,
        south: 32.7857,
        east: 35.0007,
        west: 34.9707,
      },
    },
  ];

  useEffect(() => {
    fetchDevices();
  }, [appId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/devices/app/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(res.data || []);
    } catch (err) {
      console.error("Failed to fetch devices", err);
    } finally {
      setLoading(false);
    }
  };

  const getDevicesInArea = (bounds) => {
    if (!bounds) return [];

    return devices.filter((device) => {
      const location = device.userInfo?.location;
      if (!location?.lat || !location?.lng) return false;

      return (
        location.lat >= bounds.south &&
        location.lat <= bounds.north &&
        location.lng >= bounds.west &&
        location.lng <= bounds.east
      );
    });
  };

  const handleSendNotification = async () => {
    if (!selectedArea || !notification.title || !notification.body) {
      alert("Please select an area and fill in notification details");
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/notifications/send-by-location",
        {
          appId,
          title: notification.title,
          body: notification.body,
          bounds: selectedArea.bounds,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setResult({
        success: true,
        message: res.data.message,
        devicesFound: res.data.devicesFound,
        successCount: res.data.successCount,
      });

      // Reset form
      setNotification({ title: "", body: "" });
      setSelectedArea(null);
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || "Failed to send notification",
      });
    } finally {
      setSending(false);
    }
  };

  const devicesInSelectedArea = selectedArea
    ? getDevicesInArea(selectedArea.bounds)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading devices...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-100 rounded-xl">
            <Navigation className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Location-Based Notifications
            </h2>
            <p className="text-gray-600">
              Send notifications to users in specific geographic areas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUsers(!showUsers)}
            className={`btn-secondary ${
              showUsers ? "bg-primary-100 text-primary-700" : ""
            }`}
          >
            {showUsers ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {showUsers ? "Hide Users" : "Show Users"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary-600" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {devices.length}
                </h3>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-success-600" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {devices.filter((d) => d.userInfo?.location).length}
                </h3>
                <p className="text-sm text-gray-600">With Location</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-warning-600" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {devicesInSelectedArea.length}
                </h3>
                <p className="text-sm text-gray-600">In Selected Area</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Area Selection */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            Select Target Area
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predefinedAreas.map((area, index) => (
              <motion.button
                key={area.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedArea(area)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedArea?.name === area.name
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Map className="w-5 h-5 text-primary-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{area.name}</h4>
                    <p className="text-sm text-gray-600">
                      {getDevicesInArea(area.bounds).length} users in area
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Form */}
      {selectedArea && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              Send Notification to {selectedArea.name}
            </h3>
            <p className="text-sm text-gray-600">
              {devicesInSelectedArea.length} users will receive this
              notification
            </p>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={notification.title}
                onChange={(e) =>
                  setNotification({ ...notification, title: e.target.value })
                }
                className="input"
                placeholder="Enter notification title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={notification.body}
                onChange={(e) =>
                  setNotification({ ...notification, body: e.target.value })
                }
                className="textarea"
                rows={3}
                placeholder="Enter notification message..."
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setSelectedArea(null)}
                className="btn-secondary"
              >
                <RotateCcw className="w-4 h-4" />
                Cancel
              </button>

              <button
                onClick={handleSendNotification}
                disabled={sending || !notification.title || !notification.body}
                className="btn-primary"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sending ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`card ${
              result.success
                ? "border-success-200 bg-success-50"
                : "border-error-200 bg-error-50"
            }`}
          >
            <div className="card-body">
              <div className="flex items-center gap-3">
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-success-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-error-600" />
                )}
                <div>
                  <h4
                    className={`font-medium ${
                      result.success ? "text-success-900" : "text-error-900"
                    }`}
                  >
                    {result.success ? "Success!" : "Error"}
                  </h4>
                  <p
                    className={`text-sm ${
                      result.success ? "text-success-700" : "text-error-700"
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.success && (
                    <p className="text-xs text-success-600 mt-1">
                      Found {result.devicesFound} devices, sent to{" "}
                      {result.successCount} successfully
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users List */}
      {showUsers && selectedArea && devicesInSelectedArea.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              Users in {selectedArea.name}
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devicesInSelectedArea.slice(0, 12).map((device, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        User {device.userInfo?.userId || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {device.userInfo?.location?.lat?.toFixed(4)},{" "}
                        {device.userInfo?.location?.lng?.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {devicesInSelectedArea.length > 12 && (
              <p className="text-sm text-gray-600 mt-4 text-center">
                And {devicesInSelectedArea.length - 12} more users...
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default SimpleLocationTab;
