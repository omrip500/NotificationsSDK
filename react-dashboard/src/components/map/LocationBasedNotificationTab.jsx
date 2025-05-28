import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Users,
  Send,
  Square,
  RotateCcw,
  Eye,
  EyeOff,
  Target,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../services/api";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icon for users
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component for drawing selection rectangle
function SelectionRectangle({ onSelectionChange, isSelecting, setIsSelecting }) {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [bounds, setBounds] = useState(null);

  useMapEvents({
    mousedown: (e) => {
      if (isSelecting) {
        setStartPoint([e.latlng.lat, e.latlng.lng]);
        setEndPoint(null);
        setBounds(null);
      }
    },
    mousemove: (e) => {
      if (isSelecting && startPoint) {
        setEndPoint([e.latlng.lat, e.latlng.lng]);
        const newBounds = [
          [Math.min(startPoint[0], e.latlng.lat), Math.min(startPoint[1], e.latlng.lng)],
          [Math.max(startPoint[0], e.latlng.lat), Math.max(startPoint[1], e.latlng.lng)],
        ];
        setBounds(newBounds);
      }
    },
    mouseup: (e) => {
      if (isSelecting && startPoint) {
        const finalBounds = {
          north: Math.max(startPoint[0], e.latlng.lat),
          south: Math.min(startPoint[0], e.latlng.lat),
          east: Math.max(startPoint[1], e.latlng.lng),
          west: Math.min(startPoint[1], e.latlng.lng),
        };
        onSelectionChange(finalBounds);
        setIsSelecting(false);
      }
    },
  });

  return bounds ? (
    <Rectangle
      bounds={bounds}
      pathOptions={{
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.2,
        weight: 2,
      }}
    />
  ) : null;
}

function LocationBasedNotificationTab({ appId }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBounds, setSelectedBounds] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showDevices, setShowDevices] = useState(true);
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    body: "",
  });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const mapRef = useRef();

  useEffect(() => {
    fetchDevicesWithLocation();
  }, [appId]);

  const fetchDevicesWithLocation = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/devices/app/${appId}/with-location`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(res.data || []);
    } catch (err) {
      console.error("Failed to fetch devices with location", err);
      setError("Failed to load device locations");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (bounds) => {
    setSelectedBounds(bounds);
    setError("");
    setMessage("");
  };

  const clearSelection = () => {
    setSelectedBounds(null);
    setIsSelecting(false);
    setError("");
    setMessage("");
  };

  const getDevicesInBounds = () => {
    if (!selectedBounds) return [];
    
    return devices.filter(device => {
      const lat = device.location.lat;
      const lng = device.location.lng;
      return (
        lat >= selectedBounds.south &&
        lat <= selectedBounds.north &&
        lng >= selectedBounds.west &&
        lng <= selectedBounds.east
      );
    });
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    if (!selectedBounds) {
      setError("Please select an area on the map first");
      return;
    }

    if (!notificationForm.title || !notificationForm.body) {
      setError("Please fill in both title and body");
      return;
    }

    setSending(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/notifications/send-by-location",
        {
          appId,
          title: notificationForm.title,
          body: notificationForm.body,
          bounds: selectedBounds,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(res.data.message);
      setNotificationForm({ title: "", body: "" });
      clearSelection();
    } catch (err) {
      console.error("Failed to send location-based notification", err);
      setError(err.response?.data?.message || "Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const devicesInBounds = getDevicesInBounds();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading device locations...</span>
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
          <div className="p-2 bg-primary-100 rounded-lg">
            <MapPin className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Location-Based Notifications
            </h3>
            <p className="text-sm text-gray-600">
              Send notifications to users in specific geographic areas
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-wrap items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSelecting(!isSelecting)}
              className={`btn ${isSelecting ? "btn-primary" : "btn-secondary"} flex items-center gap-2`}
            >
              <Square className="w-4 h-4" />
              {isSelecting ? "Cancel Selection" : "Select Area"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearSelection}
              disabled={!selectedBounds}
              className="btn-secondary flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Selection
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDevices(!showDevices)}
              className="btn-secondary flex items-center gap-2"
            >
              {showDevices ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showDevices ? "Hide" : "Show"} Devices
            </motion.button>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{devices.length} devices with location</span>
              {selectedBounds && (
                <>
                  <span>•</span>
                  <span className="text-primary-600 font-medium">
                    {devicesInBounds.length} in selected area
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h4 className="text-md font-semibold text-gray-900">Interactive Map</h4>
              <p className="text-sm text-gray-600">
                {isSelecting 
                  ? "Click and drag to select an area" 
                  : "Click 'Select Area' to start selecting"}
              </p>
            </div>
            <div className="card-body p-0">
              <div className="h-96 w-full">
                <MapContainer
                  center={[32.0853, 34.7818]} // Tel Aviv center
                  zoom={10}
                  style={{ height: "100%", width: "100%" }}
                  ref={mapRef}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* User devices */}
                  {showDevices && devices.map((device) => (
                    <Marker
                      key={device._id}
                      position={[device.location.lat, device.location.lng]}
                      icon={userIcon}
                    >
                      <Popup>
                        <div className="p-2">
                          <h5 className="font-semibold">User Device</h5>
                          <p className="text-sm text-gray-600">
                            ID: {device.userInfo?.userId || "Unknown"}
                          </p>
                          {device.userInfo?.gender && (
                            <p className="text-sm text-gray-600">
                              Gender: {device.userInfo.gender}
                            </p>
                          )}
                          {device.userInfo?.age && (
                            <p className="text-sm text-gray-600">
                              Age: {device.userInfo.age}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Lat: {device.location.lat.toFixed(4)}, 
                            Lng: {device.location.lng.toFixed(4)}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Selection rectangle */}
                  <SelectionRectangle
                    onSelectionChange={handleSelectionChange}
                    isSelecting={isSelecting}
                    setIsSelecting={setIsSelecting}
                  />

                  {/* Selected bounds rectangle */}
                  {selectedBounds && !isSelecting && (
                    <Rectangle
                      bounds={[
                        [selectedBounds.south, selectedBounds.west],
                        [selectedBounds.north, selectedBounds.east],
                      ]}
                      pathOptions={{
                        color: "#10b981",
                        fillColor: "#10b981",
                        fillOpacity: 0.2,
                        weight: 2,
                      }}
                    />
                  )}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSendNotification} className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-600" />
                <h4 className="text-md font-semibold text-gray-900">
                  Send Notification
                </h4>
              </div>
            </div>
            
            <div className="card-body space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Title
                </label>
                <input
                  type="text"
                  placeholder="Enter notification title"
                  value={notificationForm.title}
                  onChange={(e) =>
                    setNotificationForm({ ...notificationForm, title: e.target.value })
                  }
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
                  value={notificationForm.body}
                  onChange={(e) =>
                    setNotificationForm({ ...notificationForm, body: e.target.value })
                  }
                  className="textarea"
                  rows={4}
                  required
                />
              </div>

              {selectedBounds && (
                <div className="p-3 bg-primary-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-medium text-primary-700">
                      Selected Area
                    </span>
                  </div>
                  <div className="text-xs text-primary-600 space-y-1">
                    <div>North: {selectedBounds.north.toFixed(4)}</div>
                    <div>South: {selectedBounds.south.toFixed(4)}</div>
                    <div>East: {selectedBounds.east.toFixed(4)}</div>
                    <div>West: {selectedBounds.west.toFixed(4)}</div>
                    <div className="font-medium mt-2">
                      {devicesInBounds.length} devices in area
                    </div>
                  </div>
                </div>
              )}

              {message && (
                <div className="flex items-center gap-2 p-3 bg-success-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-success-600" />
                  <span className="text-sm text-success-700">{message}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-error-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-error-600" />
                  <span className="text-sm text-error-700">{error}</span>
                </div>
              )}
            </div>

            <div className="card-footer">
              <motion.button
                type="submit"
                disabled={sending || !selectedBounds || devicesInBounds.length === 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {sending
                  ? "Sending..."
                  : `Send to ${devicesInBounds.length} devices`}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

export default LocationBasedNotificationTab;
