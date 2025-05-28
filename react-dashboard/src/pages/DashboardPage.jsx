import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Smartphone,
  Users,
  BarChart3,
  Settings,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";

function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("android");
  const [interests, setInterests] = useState("");
  const [serviceAccountFile, setServiceAccountFile] = useState(null);
  const [clientId, setClientId] = useState("");
  const [uploadStatus, setUploadStatus] = useState(""); // "uploading", "success", "error"
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/applications/my-apps", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setApplications(res.data);
    } catch (err) {
      setError("Failed to fetch applications.");
    }
  };

  const generateClientId = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/applications/generate-client-id", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClientId(res.data.clientId);
    } catch (err) {
      setError("Failed to generate client ID.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/json") {
        setError("Please select a valid JSON file.");
        return;
      }
      setServiceAccountFile(file);
      setUploadStatus("");
    }
  };

  const uploadServiceAccount = async () => {
    if (!serviceAccountFile || !clientId) {
      setError(
        "Please select a service account file and generate a client ID."
      );
      return;
    }

    setUploadStatus("uploading");
    try {
      const fileContent = await serviceAccountFile.text();
      const token = localStorage.getItem("token");

      await api.post(
        "/applications/upload-service-account",
        {
          serviceAccountData: fileContent,
          clientId: clientId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUploadStatus("success");
    } catch (err) {
      setUploadStatus("error");
      setError(
        err.response?.data?.message || "Failed to upload service account."
      );
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (uploadStatus !== "success") {
      setError("Please upload a service account file first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const interestsArray = interests
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i);

      await api.post(
        "/applications/create",
        {
          name,
          platform,
          clientId,
          interests: interestsArray,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reset form
      setName("");
      setPlatform("android");
      setInterests("");
      setServiceAccountFile(null);
      setClientId("");
      setUploadStatus("");
      setShowCreateForm(false);
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create application.");
    } finally {
      setLoading(false);
    }
  };

  const handleAppClick = (appId) => {
    navigate(`/apps/${appId}`);
  };

  React.useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Applications
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your notification applications
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              New Application
            </motion.button>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="alert-error mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Create Form Modal */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Create New Application
              </h3>
              <form onSubmit={handleCreate} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter application name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="input"
                    >
                      <option value="android">Android</option>
                      <option value="ios">iOS</option>
                      <option value="web">Web</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interests (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., sports, news, technology"
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                {/* Firebase Setup */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Firebase Configuration
                  </h4>

                  {/* Client ID Generation */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client ID
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Generate a unique client ID"
                          value={clientId}
                          readOnly
                          className="input flex-1 bg-gray-50"
                        />
                        <button
                          type="button"
                          onClick={generateClientId}
                          className="btn-outline px-4"
                        >
                          Generate
                        </button>
                      </div>
                    </div>

                    {/* Service Account Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Firebase Service Account JSON
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">
                                  Click to upload
                                </span>{" "}
                                service account JSON
                              </p>
                              <p className="text-xs text-gray-500">
                                JSON files only
                              </p>
                            </div>
                            <input
                              type="file"
                              accept=".json"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {serviceAccountFile && (
                          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span className="text-sm text-blue-800">
                              {serviceAccountFile.name}
                            </span>
                          </div>
                        )}

                        {serviceAccountFile &&
                          clientId &&
                          uploadStatus !== "success" && (
                            <button
                              type="button"
                              onClick={uploadServiceAccount}
                              disabled={uploadStatus === "uploading"}
                              className="btn-primary w-full"
                            >
                              {uploadStatus === "uploading"
                                ? "Uploading..."
                                : "Upload Service Account"}
                            </button>
                          )}

                        {uploadStatus === "success" && (
                          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-green-800">
                              Service account uploaded successfully!
                            </span>
                          </div>
                        )}

                        {uploadStatus === "error" && (
                          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-sm text-red-800">
                              Failed to upload service account
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setName("");
                      setPlatform("android");
                      setInterests("");
                      setServiceAccountFile(null);
                      setClientId("");
                      setUploadStatus("");
                      setError(null);
                    }}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || uploadStatus !== "success"}
                    className="btn-primary flex-1"
                  >
                    {loading ? "Creating..." : "Create Application"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app, index) => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => handleAppClick(app._id)}
              className="card cursor-pointer group hover:shadow-large transition-all duration-300"
            >
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                    <Smartphone className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex gap-2">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                      <BarChart3 className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                      <Settings className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {app.name}
                </h3>
                <div className="space-y-1 mb-4">
                  <p className="text-sm text-gray-500">App ID: {app._id}</p>
                  {app.clientId && (
                    <p className="text-sm text-gray-500">
                      Client ID: {app.clientId}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Platform: {app.platform || "android"}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Click to manage</span>
                  <span className="text-primary-600 group-hover:text-primary-700">
                    →
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {applications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No applications yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first application to get started
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create Application
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
