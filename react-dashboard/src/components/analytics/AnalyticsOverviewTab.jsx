import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  Bell,
  Users,
  TrendingUp,
  Target,
  Activity,
  Clock,
  Zap,
  Eye,
  MousePointer,
  Calendar,
} from "lucide-react";
import api from "../../services/api";

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#facc15",
  "#a855f7",
  "#f97316",
  "#06b6d4",
  "#8b5cf6",
];

function AnalyticsOverviewTab({ appId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/stats/overview/${appId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [appId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Data Available
        </h3>
        <p className="text-gray-600">
          Analytics data will appear here once you start sending notifications.
        </p>
      </div>
    );
  }

  // Mock enhanced data for demonstration
  const enhancedData = {
    ...data,
    kpis: {
      totalNotifications: data?.total || 1250,
      deliveryRate: 94.5,
      openRate: 23.8,
      clickRate: 4.2,
      activeUsers: 8420,
      avgResponseTime: 1.2,
    },
    trends: data?.perDay || [
      { date: "2024-01-01", count: 45, delivered: 42, opened: 12, clicked: 2 },
      { date: "2024-01-02", count: 67, delivered: 63, opened: 18, clicked: 4 },
      { date: "2024-01-03", count: 89, delivered: 84, opened: 25, clicked: 6 },
      {
        date: "2024-01-04",
        count: 123,
        delivered: 116,
        opened: 32,
        clicked: 8,
      },
      {
        date: "2024-01-05",
        count: 156,
        delivered: 148,
        opened: 41,
        clicked: 12,
      },
      {
        date: "2024-01-06",
        count: 134,
        delivered: 127,
        opened: 35,
        clicked: 9,
      },
      {
        date: "2024-01-07",
        count: 178,
        delivered: 169,
        opened: 48,
        clicked: 15,
      },
    ],
    hourlyDistribution: [
      { hour: "00", count: 12 },
      { hour: "01", count: 8 },
      { hour: "02", count: 5 },
      { hour: "03", count: 3 },
      { hour: "04", count: 2 },
      { hour: "05", count: 4 },
      { hour: "06", count: 15 },
      { hour: "07", count: 28 },
      { hour: "08", count: 45 },
      { hour: "09", count: 67 },
      { hour: "10", count: 89 },
      { hour: "11", count: 92 },
      { hour: "12", count: 78 },
      { hour: "13", count: 85 },
      { hour: "14", count: 76 },
      { hour: "15", count: 82 },
      { hour: "16", count: 88 },
      { hour: "17", count: 95 },
      { hour: "18", count: 102 },
      { hour: "19", count: 87 },
      { hour: "20", count: 65 },
      { hour: "21", count: 45 },
      { hour: "22", count: 32 },
      { hour: "23", count: 18 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          {
            title: "Total Notifications",
            value: enhancedData.kpis.totalNotifications.toLocaleString(),
            icon: Bell,
            color: "primary",
            change: "+12.5%",
          },
          {
            title: "Delivery Rate",
            value: `${enhancedData.kpis.deliveryRate}%`,
            icon: Target,
            color: "success",
            change: "+2.1%",
          },
          {
            title: "Open Rate",
            value: `${enhancedData.kpis.openRate}%`,
            icon: Eye,
            color: "warning",
            change: "+0.8%",
          },
          {
            title: "Click Rate",
            value: `${enhancedData.kpis.clickRate}%`,
            icon: MousePointer,
            color: "primary",
            change: "+1.2%",
          },
          {
            title: "Active Users",
            value: enhancedData.kpis.activeUsers.toLocaleString(),
            icon: Users,
            color: "success",
            change: "+5.7%",
          },
          {
            title: "Avg Response",
            value: `${enhancedData.kpis.avgResponseTime}s`,
            icon: Zap,
            color: "warning",
            change: "-0.3s",
          },
        ].map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card group hover:shadow-medium transition-all duration-300"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div
                  className={`p-3 rounded-xl bg-${kpi.color}-100 group-hover:bg-${kpi.color}-200 transition-colors`}
                >
                  <kpi.icon className={`w-6 h-6 text-${kpi.color}-600`} />
                </div>
                <span
                  className={`text-sm font-medium ${
                    kpi.change.startsWith("+")
                      ? "text-success-600"
                      : "text-error-600"
                  }`}
                >
                  {kpi.change}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {kpi.value}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{kpi.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Notification Trends
              </h3>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={enhancedData.trends}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorDelivered"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorSent)"
                  strokeWidth={2}
                  name="Sent"
                />
                <Area
                  type="monotone"
                  dataKey="delivered"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorDelivered)"
                  strokeWidth={2}
                  name="Delivered"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Hourly Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Hourly Distribution
              </h3>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enhancedData.hourlyDistribution}>
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Notifications"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gender Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Gender Distribution
              </h3>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "Male",
                      value: data?.genderDistribution?.male || 45,
                      color: "#3b82f6",
                    },
                    {
                      name: "Female",
                      value: data?.genderDistribution?.female || 55,
                      color: "#ef4444",
                    },
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={5}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Interests Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Interest Categories
              </h3>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={
                    data?.interests || [
                      { name: "Tech", count: 25 },
                      { name: "Sports", count: 20 },
                      { name: "Health", count: 18 },
                      { name: "Finance", count: 15 },
                      { name: "Food", count: 12 },
                      { name: "Others", count: 10 },
                    ]
                  }
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {(data?.interests || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AnalyticsOverviewTab;
