import { useState } from "react";
import AnalyticsOverviewTab from "./AnalyticsOverviewTab";
import AnalyticsPerUserTab from "./AnalyticsPerUserTab";
import "./StatisticsTab.css";

function StatisticsTab({ appId }) {
  const [subTab, setSubTab] = useState("general");

  return (
    <div className="statistics-tab">
      <div className="sub-tabs">
        <button
          className={subTab === "general" ? "active" : ""}
          onClick={() => setSubTab("general")}
        >
          General Analytics
        </button>
        <button
          className={subTab === "user" ? "active" : ""}
          onClick={() => setSubTab("user")}
        >
          User Analytics
        </button>
      </div>

      <div className="sub-tab-content">
        {subTab === "general" && <AnalyticsOverviewTab appId={appId} />}
        {subTab === "user" && <AnalyticsPerUserTab appId={appId} />}
      </div>
    </div>
  );
}

export default StatisticsTab;
