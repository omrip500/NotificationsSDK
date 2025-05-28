import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Search,
  Filter,
  Calendar,
  Edit3,
  Trash2,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send,
  Users,
  Target,
} from "lucide-react";
import api from "../../services/api";

function ScheduledNotificationsTab({ appId }) {
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    body: "",
    sendAt: "",
    filters: {},
  });

  useEffect(() => {
    fetchScheduledNotifications();
  }, [appId]);

  useEffect(() => {
    filterNotifications();
  }, [scheduledNotifications, searchTerm, dateFilter]);

  const fetchScheduledNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/notifications/scheduled/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScheduledNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch scheduled notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = scheduledNotifications;

    // Filter only pending notifications that haven't been sent yet
    filtered = filtered.filter((notification) => {
      return (
        notification.status === "pending" &&
        new Date(notification.sendAt) > new Date()
      );
    });

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.body.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (dateFilter.from || dateFilter.to) {
      filtered = filtered.filter((notification) => {
        const sendDate = new Date(notification.sendAt);
        const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
        const toDate = dateFilter.to
          ? new Date(dateFilter.to + "T23:59:59")
          : null;

        if (fromDate && sendDate < fromDate) return false;
        if (toDate && sendDate > toDate) return false;
        return true;
      });
    }

    setFilteredNotifications(filtered);
  };

  const handleEdit = (notification) => {
    setSelectedNotification(notification);
    setEditForm({
      title: notification.title,
      body: notification.body,
      sendAt: new Date(notification.sendAt).toISOString().slice(0, 16),
      filters: notification.filters || {},
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/notifications/scheduled/${selectedNotification._id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowEditModal(false);
      fetchScheduledNotifications();
    } catch (err) {
      console.error("Failed to update notification", err);
      alert("Failed to update notification");
    }
  };

  const handleDelete = async (notificationId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this scheduled notification?"
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/notifications/scheduled/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchScheduledNotifications();
    } catch (err) {
      console.error("Failed to delete notification", err);
      alert("Failed to delete notification");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-warning-600" />;
      case "sent":
        return <CheckCircle className="w-4 h-4 text-success-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-error-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "badge-warning";
      case "sent":
        return "badge-success";
      case "failed":
        return "badge-error";
      default:
        return "badge-secondary";
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeUntilSend = (sendAt) => {
    const now = new Date();
    const sendTime = new Date(sendAt);
    const diffMs = sendTime - now;

    if (diffMs <= 0) return "Past due";

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} left`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} left`;
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} left`;
    }
  };

  const getFiltersDescription = (filters) => {
    if (!filters || Object.keys(filters).length === 0) {
      return "All users";
    }

    const descriptions = [];
    if (filters.gender) descriptions.push(`Gender: ${filters.gender}`);
    if (filters.ageMin || filters.ageMax) {
      descriptions.push(`Age: ${filters.ageMin || 0}-${filters.ageMax || "∞"}`);
    }
    if (filters.interests && filters.interests.length > 0) {
      descriptions.push(
        `Interests: ${filters.interests.slice(0, 2).join(", ")}${
          filters.interests.length > 2 ? "..." : ""
        }`
      );
    }
    if (filters.location) {
      descriptions.push("Location-based");
    }

    return descriptions.join(" • ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">
            Loading scheduled notifications...
          </span>
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
            <Clock className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Scheduled Notifications
            </h3>
            <p className="text-sm text-gray-600">
              Manage your future notification deliveries
            </p>
          </div>
        </div>
      </div>

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
                  {filteredNotifications.length} of{" "}
                  {scheduledNotifications.length} notifications
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
                      setDateFilter({ ...dateFilter, from: e.target.value })
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
                      setDateFilter({ ...dateFilter, to: e.target.value })
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
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {scheduledNotifications.length === 0
              ? "No scheduled notifications"
              : filteredNotifications.length === 0 &&
                scheduledNotifications.length > 0
              ? "No notifications match your search"
              : "No pending notifications"}
          </h3>
          <p className="text-gray-600">
            {scheduledNotifications.length === 0
              ? "Schedule notifications to see them here"
              : filteredNotifications.length === 0 &&
                scheduledNotifications.length > 0
              ? "Try adjusting your search terms or date filters"
              : "All scheduled notifications have been sent or are in the past"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card group hover:shadow-medium transition-all duration-300"
            >
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(notification.status)}
                      <h4 className="text-lg font-semibold text-gray-900 truncate">
                        {notification.title}
                      </h4>
                      <span
                        className={`badge ${getStatusColor(
                          notification.status
                        )}`}
                      >
                        {notification.status}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {notification.body}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {formatDateTime(notification.sendAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-500" />
                        <span className="text-primary-600 font-medium">
                          {getTimeUntilSend(notification.sendAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 truncate">
                          {getFiltersDescription(notification.filters)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          Created{" "}
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {notification.status === "pending" && (
                    <div className="flex items-center gap-2 ml-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(notification)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit notification"
                      >
                        <Edit3 className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(notification._id)}
                        className="p-2 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Scheduled Notification
                </h3>
              </div>

              <div className="card-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body
                  </label>
                  <textarea
                    value={editForm.body}
                    onChange={(e) =>
                      setEditForm({ ...editForm, body: e.target.value })
                    }
                    className="textarea"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send At
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.sendAt}
                    onChange={(e) =>
                      setEditForm({ ...editForm, sendAt: e.target.value })
                    }
                    className="input"
                  />
                </div>
              </div>

              <div className="card-footer">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button onClick={handleUpdate} className="btn-primary">
                    Update Notification
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ScheduledNotificationsTab;
