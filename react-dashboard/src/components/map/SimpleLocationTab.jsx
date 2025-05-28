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
  const [cityNames, setCityNames] = useState({});
  const [areasWithCityNames, setAreasWithCityNames] = useState([]);

  // Function to get city name from coordinates using reverse geocoding
  const getCityName = async (lat, lng) => {
    const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;

    // Check if we already have this city name cached
    if (cityNames[key]) {
      return cityNames[key];
    }

    try {
      // Using OpenStreetMap Nominatim API (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await response.json();

      let cityName = "Unknown Location";

      if (data && data.address) {
        // Try to get city name from various fields
        cityName =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.municipality ||
          data.address.county ||
          data.display_name?.split(",")[0] ||
          "Unknown Location";
      }

      // Cache the result
      setCityNames((prev) => ({
        ...prev,
        [key]: cityName,
      }));

      return cityName;
    } catch (error) {
      console.error("Error getting city name:", error);
      return "Unknown Location";
    }
  };

  // Generate dynamic areas based on actual user locations
  const generateAreasFromUsers = () => {
    const usersWithLocation = devices.filter(
      (device) =>
        device.userInfo?.location?.lat && device.userInfo?.location?.lng
    );

    if (usersWithLocation.length === 0) return [];

    // Group users by approximate location (0.1 degree radius ≈ 11km)
    const locationGroups = {};

    usersWithLocation.forEach((device) => {
      const lat = device.userInfo.location.lat;
      const lng = device.userInfo.location.lng;

      // Round to create location clusters
      const clusterLat = Math.round(lat * 10) / 10;
      const clusterLng = Math.round(lng * 10) / 10;
      const key = `${clusterLat},${clusterLng}`;

      if (!locationGroups[key]) {
        locationGroups[key] = {
          users: [],
          centerLat: clusterLat,
          centerLng: clusterLng,
        };
      }
      locationGroups[key].users.push(device);
    });

    // Convert groups to areas (only groups with 1+ users)
    return Object.entries(locationGroups)
      .filter(([_, group]) => group.users.length >= 1) // Show areas with at least 1 user
      .map(([key, group], index) => {
        const radius = 0.05; // ~5.5km radius
        return {
          name: `Loading... (${group.users.length} users)`, // Temporary name
          bounds: {
            north: group.centerLat + radius,
            south: group.centerLat - radius,
            east: group.centerLng + radius,
            west: group.centerLng - radius,
          },
          userCount: group.users.length,
          center: {
            lat: group.centerLat,
            lng: group.centerLng,
          },
          key: key, // Add key for identification
        };
      })
      .sort((a, b) => b.userCount - a.userCount); // Sort by user count
  };

  const dynamicAreas = generateAreasFromUsers();

  useEffect(() => {
    fetchDevices();
  }, [appId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load city names for all areas
  useEffect(() => {
    const loadCityNames = async () => {
      const updatedAreas = [];

      for (let i = 0; i < dynamicAreas.length; i++) {
        const area = dynamicAreas[i];
        const key = area.key;
        let cityName = cityNames[key];

        if (!cityName) {
          // Add delay between requests to respect rate limits
          if (i > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
          }
          cityName = await getCityName(area.center.lat, area.center.lng);
        }

        updatedAreas.push({
          ...area,
          name: `${cityName} (${area.userCount} users)`,
          cityName: cityName,
        });

        // Update state progressively so user sees results as they load
        setAreasWithCityNames([...updatedAreas]);
      }
    };

    if (dynamicAreas.length > 0) {
      // Start with loading state
      const loadingAreas = dynamicAreas.map((area) => ({
        ...area,
        name: `Loading... (${area.userCount} users)`,
      }));
      setAreasWithCityNames(loadingAreas);

      loadCityNames();
    } else {
      setAreasWithCityNames([]);
    }
  }, [dynamicAreas]); // eslint-disable-line react-hooks/exhaustive-deps

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
      console.log("🚀 Sending location-based notification:", {
        appId,
        title: notification.title,
        body: notification.body,
        bounds: selectedArea.bounds,
      });

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

      console.log("✅ Location notification response:", res.data);

      setResult({
        success: true,
        message: res.data.message || "Notification sent successfully!",
        devicesFound: res.data.devicesFound || 0,
        successCount: res.data.successCount || 0,
      });

      // Reset form
      setNotification({ title: "", body: "" });
      setSelectedArea(null);
    } catch (err) {
      console.error("❌ Location notification error:", err);
      console.error("Error response:", err.response?.data);

      setResult({
        success: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to send notification",
        error: err.response?.data?.error || "Unknown error",
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
          {areasWithCityNames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areasWithCityNames.map((area, index) => (
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
                      <h4 className="font-medium text-gray-900">
                        {area.name.includes("Loading...") ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                            Loading location...
                          </div>
                        ) : (
                          area.name
                        )}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {area.userCount} users in this area
                      </p>
                      {!area.name.includes("Loading...") && (
                        <p className="text-xs text-gray-500">
                          Center: {area.center.lat.toFixed(3)},{" "}
                          {area.center.lng.toFixed(3)}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Location Data
              </h4>
              <p className="text-gray-600">
                No users have location data available for targeting.
              </p>
            </div>
          )}
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
                  {!result.success && result.error && (
                    <p className="text-xs text-error-600 mt-1">
                      Error details: {result.error}
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
