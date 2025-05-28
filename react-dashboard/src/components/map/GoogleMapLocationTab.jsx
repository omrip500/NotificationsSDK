import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Users,
  Send,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Square,
  Trash2,
  Navigation,
  Target,
} from "lucide-react";
import api from "../../services/api";

function GoogleMapLocationTab({ appId }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState(null);
  const [notification, setNotification] = useState({
    title: "",
    body: "",
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingRectangle, setDrawingRectangle] = useState(null);

  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const rectangleRef = useRef(null);

  useEffect(() => {
    fetchDevices();
  }, [appId]);

  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=drawing`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, [devices]);

  const initializeMap = () => {
    if (!mapRef.current || devices.length === 0) return;

    // Find center point from all devices with location
    const devicesWithLocation = devices.filter(
      (d) => d.userInfo?.location?.lat && d.userInfo?.location?.lng
    );

    if (devicesWithLocation.length === 0) return;

    const center = {
      lat:
        devicesWithLocation.reduce(
          (sum, d) => sum + d.userInfo.location.lat,
          0
        ) / devicesWithLocation.length,
      lng:
        devicesWithLocation.reduce(
          (sum, d) => sum + d.userInfo.location.lng,
          0
        ) / devicesWithLocation.length,
    };

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 10,
      center: center,
      mapTypeId: "roadmap",
    });

    googleMapRef.current = map;

    // Add markers for each device
    devicesWithLocation.forEach((device, index) => {
      const marker = new window.google.maps.Marker({
        position: {
          lat: device.userInfo.location.lat,
          lng: device.userInfo.location.lng,
        },
        map: map,
        title: `User ${device.userInfo?.userId || index + 1}`,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
              <circle cx="10" cy="10" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(20, 20),
        },
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h4 style="margin: 0 0 4px 0; font-weight: bold;">User ${
              device.userInfo?.userId || "Unknown"
            }</h4>
            <p style="margin: 0; font-size: 12px; color: #666;">
              ${device.userInfo.location.lat.toFixed(
                4
              )}, ${device.userInfo.location.lng.toFixed(4)}
            </p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    });

    // Add click listener for drawing rectangles
    map.addListener("click", (event) => {
      if (isDrawing) {
        handleMapClick(event);
      }
    });
  };

  const handleMapClick = (event) => {
    if (!isDrawing) return;

    const clickedLat = event.latLng.lat();
    const clickedLng = event.latLng.lng();

    if (!drawingRectangle) {
      // First click - start drawing
      setDrawingRectangle({
        startLat: clickedLat,
        startLng: clickedLng,
        endLat: clickedLat,
        endLng: clickedLng,
      });
    } else {
      // Second click - finish drawing
      const bounds = {
        north: Math.max(drawingRectangle.startLat, clickedLat),
        south: Math.min(drawingRectangle.startLat, clickedLat),
        east: Math.max(drawingRectangle.startLng, clickedLng),
        west: Math.min(drawingRectangle.startLng, clickedLng),
      };

      const devicesInArea = getDevicesInArea(bounds);

      setSelectedArea({
        bounds,
        name: `Selected Area (${devicesInArea.length} users)`,
        userCount: devicesInArea.length,
      });

      // Draw rectangle on map
      if (rectangleRef.current) {
        rectangleRef.current.setMap(null);
      }

      const rectangle = new window.google.maps.Rectangle({
        bounds: new window.google.maps.LatLngBounds(
          { lat: bounds.south, lng: bounds.west },
          { lat: bounds.north, lng: bounds.east }
        ),
        editable: false,
        draggable: false,
        fillColor: "#3B82F6",
        fillOpacity: 0.2,
        strokeColor: "#3B82F6",
        strokeOpacity: 0.8,
        strokeWeight: 2,
      });

      rectangle.setMap(googleMapRef.current);
      rectangleRef.current = rectangle;

      setIsDrawing(false);
      setDrawingRectangle(null);
    }
  };

  const startDrawing = () => {
    setIsDrawing(true);
    setDrawingRectangle(null);
    setSelectedArea(null);

    // Clear existing rectangle
    if (rectangleRef.current) {
      rectangleRef.current.setMap(null);
      rectangleRef.current = null;
    }
  };

  const clearSelection = () => {
    setSelectedArea(null);
    setIsDrawing(false);
    setDrawingRectangle(null);

    if (rectangleRef.current) {
      rectangleRef.current.setMap(null);
      rectangleRef.current = null;
    }
  };

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
      clearSelection();
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
              Draw an area on the map to send notifications to users in that
              region
            </p>
          </div>
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

      {/* Map and Controls */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Interactive Map
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={startDrawing}
                disabled={isDrawing}
                className={`btn-primary ${
                  isDrawing ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Square className="w-4 h-4" />
                {isDrawing ? "Click on map to draw area" : "Draw Area"}
              </button>
              {selectedArea && (
                <button onClick={clearSelection} className="btn-secondary">
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>
          {isDrawing && (
            <p className="text-sm text-blue-600 mt-2">
              Click two points on the map to create a rectangular area
            </p>
          )}
          {selectedArea && (
            <p className="text-sm text-green-600 mt-2">
              Selected area contains {selectedArea.userCount} users
            </p>
          )}
        </div>
        <div className="card-body p-0">
          <div
            ref={mapRef}
            className="w-full h-96 rounded-lg"
            style={{ minHeight: "400px" }}
          />
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
              Send Notification to Selected Area
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
              <button onClick={clearSelection} className="btn-secondary">
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
    </motion.div>
  );
}

export default GoogleMapLocationTab;
