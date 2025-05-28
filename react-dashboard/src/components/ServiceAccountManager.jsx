import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
} from "lucide-react";
import api from "../services/api";

function ServiceAccountManager({ appId }) {
  const [serviceAccountStatus, setServiceAccountStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newServiceAccountFile, setNewServiceAccountFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchServiceAccountStatus();
  }, [appId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchServiceAccountStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get(
        `/applications/${appId}/service-account-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setServiceAccountStatus(res.data);
    } catch (err) {
      setError("Failed to fetch service account status");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/json") {
        setError("Please select a valid JSON file.");
        return;
      }
      setNewServiceAccountFile(file);
      setError("");
      setSuccess("");
    }
  };

  const handleUpdateServiceAccount = async () => {
    if (!newServiceAccountFile) {
      setError("Please select a service account file.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const fileContent = await newServiceAccountFile.text();
      const token = localStorage.getItem("token");

      await api.put(
        `/applications/${appId}/service-account`,
        {
          serviceAccountData: fileContent,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Service account updated successfully!");
      setNewServiceAccountFile(null);
      fetchServiceAccountStatus();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update service account."
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">
              Loading service account status...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Settings className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Firebase Service Account
            </h3>
            <p className="text-sm text-gray-600">
              Manage your Firebase service account configuration
            </p>
          </div>
        </div>
      </div>

      <div className="card-body space-y-6">
        {/* Current Status */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Current Status
          </h4>
          {serviceAccountStatus ? (
            <div className="space-y-3">
              {serviceAccountStatus.status === "active" ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-green-800">
                      Service account is active
                    </span>
                    <div className="text-xs text-green-700 mt-1">
                      Project ID: {serviceAccountStatus.projectId}
                    </div>
                    <div className="text-xs text-green-700">
                      Client Email: {serviceAccountStatus.clientEmail}
                    </div>
                    <div className="text-xs text-green-700">
                      Last Modified:{" "}
                      {new Date(
                        serviceAccountStatus.lastModified
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-red-800">
                      Service account not found
                    </span>
                    <div className="text-xs text-red-700 mt-1">
                      ⚠️ Your application cannot send notifications without a
                      Firebase service account. Please upload your service
                      account JSON file below.
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-800">
                Unable to check status
              </span>
            </div>
          )}
        </div>

        {/* Upload New Service Account */}
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">
            {serviceAccountStatus?.status === "active" ? "Update" : "Upload"}{" "}
            Service Account
          </h4>

          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> new
                    service account JSON
                  </p>
                  <p className="text-xs text-gray-500">JSON files only</p>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {newServiceAccountFile && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-800">
                  {newServiceAccountFile.name}
                </span>
              </div>
            )}

            {newServiceAccountFile && (
              <button
                onClick={handleUpdateServiceAccount}
                disabled={uploading}
                className="btn-primary w-full"
              >
                {uploading
                  ? "Uploading..."
                  : serviceAccountStatus?.status === "active"
                  ? "Update Service Account"
                  : "Upload Service Account"}
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-800">{success}</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <button
          onClick={fetchServiceAccountStatus}
          className="btn-outline flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Status
        </button>
      </div>
    </motion.div>
  );
}

export default ServiceAccountManager;
