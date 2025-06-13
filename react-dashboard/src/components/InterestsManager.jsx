import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, Save, Filter, Trash2, Edit3 } from "lucide-react";
import api from "../services/api";

function InterestsManager({ appId, availableInterests, onInterestsUpdated }) {
  const [newInterest, setNewInterest] = useState("");
  const [editingInterest, setEditingInterest] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleAddInterest = async () => {
    if (!newInterest.trim()) return;

    const updatedInterests = [...availableInterests, newInterest.trim()];
    await updateInterests(updatedInterests);
    setNewInterest("");
  };

  const handleRemoveInterest = async (interestToRemove) => {
    const updatedInterests = availableInterests.filter(
      (interest) => interest !== interestToRemove
    );
    await updateInterests(updatedInterests);
  };

  const handleEditInterest = (interest) => {
    setEditingInterest(interest);
    setEditValue(interest);
  };

  const handleSaveEdit = async () => {
    if (!editValue.trim()) return;

    const updatedInterests = availableInterests.map((interest) =>
      interest === editingInterest ? editValue.trim() : interest
    );
    await updateInterests(updatedInterests);
    setEditingInterest(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingInterest(null);
    setEditValue("");
  };

  const updateInterests = async (interests) => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/applications/${appId}/interests`,
        { interests },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("Interests updated successfully!");
      if (onInterestsUpdated) {
        onInterestsUpdated();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update interests"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Filter className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Manage Interests
              </h3>
              <p className="text-sm text-gray-600">
                Configure available interests for your application
              </p>
            </div>
          </div>
        </div>

        <div className="card-body space-y-6">
          {/* Add New Interest */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">
              Add New Interest
            </h4>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter interest name (e.g., sports, technology)"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddInterest()}
                  className="input"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddInterest}
                disabled={!newInterest.trim() || loading}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </motion.button>
            </div>
          </div>

          {/* Current Interests */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">
              Current Interests ({availableInterests.length})
            </h4>

            {availableInterests.length === 0 ? (
              <div className="text-center py-8">
                <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No interests configured
                </h3>
                <p className="text-gray-600">
                  Add interests to allow users to choose their notification preferences
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableInterests.map((interest, index) => (
                  <motion.div
                    key={interest}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                  >
                    {editingInterest === interest ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") handleSaveEdit();
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          className="input text-sm flex-1"
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 text-success-600 hover:bg-success-100 rounded"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-gray-900 flex-1">
                          {interest}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditInterest(interest)}
                            className="p-1 text-gray-600 hover:text-primary-600 hover:bg-primary-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveInterest(interest)}
                            className="p-1 text-gray-600 hover:text-error-600 hover:bg-error-100 rounded transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          {(message || error) && (
            <div className="space-y-2">
              {message && (
                <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                  <p className="text-sm text-success-800">{message}</p>
                </div>
              )}
              {error && (
                <div className="p-3 bg-error-50 border border-error-200 rounded-lg">
                  <p className="text-sm text-error-800">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="text-sm font-medium text-blue-900 mb-2">
              💡 How it works
            </h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Interests you configure here will be available in your mobile app</li>
              <li>• Users can select their preferred interests during notification setup</li>
              <li>• You can target notifications to specific interests when sending</li>
              <li>• Changes are applied immediately to your SDK configuration</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default InterestsManager;
