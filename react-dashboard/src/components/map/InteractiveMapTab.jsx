import { useState, useEffect, useRef, useCallback } from "react";
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
  MousePointer,
} from "lucide-react";
import api from "../../services/api";

function InteractiveMapTab({ appId }) {
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
  const [drawingStart, setDrawingStart] = useState(null);

  const canvasRef = useRef(null);

  useEffect(() => {
    fetchDevices();
  }, [appId]);

  useEffect(() => {
    if (devices.length > 0) {
      // Add a small delay to ensure canvas is rendered
      setTimeout(() => {
        drawMap();
      }, 100);
    } else if (!loading) {
      // Draw empty map even without devices
      setTimeout(() => {
        drawMap();
      }, 100);
    }
  }, [devices, selectedArea, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Add resize listener
  useEffect(() => {
    const handleResize = () => {
      if (devices.length > 0) {
        setTimeout(() => {
          drawMap();
        }, 100);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [devices, selectedArea]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/devices/app/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched devices:", res.data);
      setDevices(res.data || []);
    } catch (err) {
      console.error("Failed to fetch devices", err);
    } finally {
      setLoading(false);
    }
  };

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("Canvas not found");
      return;
    }

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    // Set canvas size with device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    console.log("Drawing map with canvas size:", rect.width, "x", rect.height);

    // Draw background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Get devices with location
    const devicesWithLocation = devices.filter(
      (d) => d.userInfo?.location?.lat && d.userInfo?.location?.lng
    );

    console.log("Devices with location:", devicesWithLocation.length);

    if (devicesWithLocation.length === 0) {
      // Draw "No data" message
      ctx.fillStyle = "#64748b";
      ctx.font = "16px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        "No location data available",
        rect.width / 2,
        rect.height / 2
      );
      return;
    }

    // Find bounds
    const lats = devicesWithLocation.map((d) => d.userInfo.location.lat);
    const lngs = devicesWithLocation.map((d) => d.userInfo.location.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Add padding
    const latPadding = (maxLat - minLat) * 0.1;
    const lngPadding = (maxLng - minLng) * 0.1;

    const bounds = {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding,
    };

    // Convert lat/lng to canvas coordinates
    const latLngToCanvas = (lat, lng) => {
      const x =
        ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * rect.width;
      const y =
        ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * rect.height;
      return { x, y };
    };

    // Draw background grid
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * rect.width;
      const y = (i / 10) * rect.height;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    console.log("Drawing", devicesWithLocation.length, "users on map");

    // Draw users
    devicesWithLocation.forEach((device) => {
      const pos = latLngToCanvas(
        device.userInfo.location.lat,
        device.userInfo.location.lng
      );

      // Draw user dot
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Draw white border
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw selected area
    if (selectedArea && selectedArea.bounds) {
      const topLeft = latLngToCanvas(
        selectedArea.bounds.north,
        selectedArea.bounds.west
      );
      const bottomRight = latLngToCanvas(
        selectedArea.bounds.south,
        selectedArea.bounds.east
      );

      ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
      ctx.fillRect(
        topLeft.x,
        topLeft.y,
        bottomRight.x - topLeft.x,
        bottomRight.y - topLeft.y
      );

      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        topLeft.x,
        topLeft.y,
        bottomRight.x - topLeft.x,
        bottomRight.y - topLeft.y
      );
    }

    // Store conversion function for click handling
    canvas.latLngToCanvas = latLngToCanvas;
    canvas.bounds = bounds;
    canvas.rect = rect;
  }, [devices, selectedArea]);

  const handleCanvasClick = (event) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log("Canvas clicked at:", x, y);

    // Convert canvas coordinates back to lat/lng
    const lng =
      canvas.bounds.minLng +
      (x / canvas.rect.width) * (canvas.bounds.maxLng - canvas.bounds.minLng);
    const lat =
      canvas.bounds.maxLat -
      (y / canvas.rect.height) * (canvas.bounds.maxLat - canvas.bounds.minLat);

    if (!drawingStart) {
      setDrawingStart({ lat, lng });
    } else {
      // Complete the rectangle
      const bounds = {
        north: Math.max(drawingStart.lat, lat),
        south: Math.min(drawingStart.lat, lat),
        east: Math.max(drawingStart.lng, lng),
        west: Math.min(drawingStart.lng, lng),
      };

      const devicesInArea = getDevicesInArea(bounds);

      setSelectedArea({
        bounds,
        name: `Selected Area (${devicesInArea.length} users)`,
        userCount: devicesInArea.length,
      });

      setIsDrawing(false);
      setDrawingStart(null);
    }
  };

  const startDrawing = () => {
    setIsDrawing(true);
    setDrawingStart(null);
    setSelectedArea(null);
  };

  const clearSelection = () => {
    setSelectedArea(null);
    setIsDrawing(false);
    setDrawingStart(null);
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
              Click and drag on the map to select an area and send notifications
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

      {/* Interactive Map */}
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
                {isDrawing ? "Click two points on map" : "Draw Area"}
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
            <div className="flex items-center gap-2 mt-2 p-3 bg-blue-50 rounded-lg">
              <MousePointer className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-700">
                {!drawingStart
                  ? "Click on the map to start drawing"
                  : "Click again to complete the rectangle"}
              </p>
            </div>
          )}
          {selectedArea && (
            <div className="flex items-center gap-2 mt-2 p-3 bg-green-50 rounded-lg">
              <Target className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-700">
                Selected area contains {selectedArea.userCount} users
              </p>
            </div>
          )}
        </div>
        <div className="card-body p-0">
          <div className="relative">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full border rounded-lg cursor-crosshair bg-gray-100"
              style={{ height: "400px", width: "100%" }}
            />
            {devices.filter((d) => d.userInfo?.location).length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No Location Data
                  </h4>
                  <p className="text-gray-600">
                    No users have location data available for mapping.
                  </p>
                </div>
              </div>
            )}
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

export default InteractiveMapTab;
