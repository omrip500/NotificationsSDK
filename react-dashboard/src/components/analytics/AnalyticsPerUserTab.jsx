import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Users,
  Search,
  Filter,
  ArrowLeft,
  Bell,
  Heart,
  Calendar,
  Activity,
  Eye,
} from "lucide-react";
import api from "../../services/api";
import UserAnalyticsPanel from "./UserAnalyticsPanel";

function AnalyticsPerUserTab({ appId }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/stats/per-user/${appId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data || []);
        setFilteredUsers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch per-user analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [appId]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.gender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.interests?.some((interest) =>
            interest.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading user analytics...</span>
        </div>
      </div>
    );
  }

  if (selectedUser) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <motion.button
          onClick={() => setSelectedUser(null)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users Table
        </motion.button>
        <UserAnalyticsPanel user={selectedUser} />
      </motion.div>
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
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              User Analytics
            </h3>
            <p className="text-sm text-gray-600">
              Detailed analytics for {filteredUsers.length} users
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by ID, gender, or interests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {filteredUsers.length} of {users.length} users
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {users.length === 0
              ? "No users found"
              : "No users match your search"}
          </h3>
          <p className="text-gray-600">
            {users.length === 0
              ? "Users will appear here once they register devices"
              : "Try adjusting your search terms"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedUser(user)}
              className="card group hover:shadow-medium transition-all duration-300 cursor-pointer"
            >
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {user.userId}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {user.gender || "Unknown"} • {user.age || "Unknown age"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-primary-600">
                    <Bell className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {user.notifications}
                    </span>
                  </div>
                </div>

                {/* Interests */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Interests
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {user.interests && user.interests.length > 0 ? (
                      user.interests.slice(0, 3).map((interest, idx) => (
                        <span key={idx} className="badge badge-primary text-xs">
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">
                        No interests
                      </span>
                    )}
                    {user.interests && user.interests.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{user.interests.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Activity Summary */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Activity className="w-4 h-4" />
                      <span>Activity</span>
                    </div>
                    <span className="text-gray-900 font-medium">
                      {user.perDay?.length || 0} days active
                    </span>
                  </div>
                </div>

                {/* Click to view more indicator */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-center text-primary-600 group-hover:text-primary-700">
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">
                      Click to view details
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default AnalyticsPerUserTab;
