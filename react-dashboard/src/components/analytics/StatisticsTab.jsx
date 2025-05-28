import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users } from "lucide-react";
import AnalyticsOverviewTab from "./AnalyticsOverviewTab";
import AnalyticsPerUserTab from "./AnalyticsPerUserTab";

function StatisticsTab({ appId }) {
  const [subTab, setSubTab] = useState("general");

  const tabs = [
    {
      id: "general",
      label: "General Analytics",
      icon: BarChart3,
      description: "Overview of notification performance and user demographics",
    },
    {
      id: "user",
      label: "User Analytics",
      icon: Users,
      description: "Individual user behavior and engagement patterns",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Sub-tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                subTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <div className="text-left">
                <div>{tab.label}</div>
                <div className="text-xs text-gray-400 font-normal hidden sm:block">
                  {tab.description}
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {subTab === "general" && <AnalyticsOverviewTab appId={appId} />}
        {subTab === "user" && <AnalyticsPerUserTab appId={appId} />}
      </div>
    </motion.div>
  );
}

export default StatisticsTab;
