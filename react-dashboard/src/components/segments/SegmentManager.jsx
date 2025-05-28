import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Edit, Trash2, Filter, Tag } from "lucide-react";
import api from "../../services/api";
import SegmentForm from "./SegmentForm";

function SegmentManager({ appId, onSegmentsChange }) {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSegment, setEditingSegment] = useState(null);

  useEffect(() => {
    fetchSegments();
  }, [appId]);

  const fetchSegments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/segments/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSegments(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch segments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this segment?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/segments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchSegments();
      if (onSegmentsChange) onSegmentsChange();
    } catch (err) {
      console.error("❌ Failed to delete segment", err);
      alert("Failed to delete segment");
    }
  };

  const handleUpdate = async (updatedSegment) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(`/segments/${updatedSegment._id}`, updatedSegment, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingSegment(null);
      await fetchSegments();
      if (onSegmentsChange) onSegmentsChange();
    } catch (err) {
      console.error("❌ Failed to update segment", err);
      alert("Failed to update segment");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Users className="w-5 h-5 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Saved Segments</h3>
      </div>

      {editingSegment && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
        >
          <div className="card-header">
            <h4 className="font-semibold text-gray-900">Edit Segment</h4>
          </div>
          <div className="card-body">
            <SegmentForm
              appId={appId}
              editMode
              initialValues={editingSegment}
              onUpdate={handleUpdate}
              onCancel={() => setEditingSegment(null)}
            />
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading segments...</span>
          </div>
        </div>
      ) : segments.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No segments created yet
          </h3>
          <p className="text-gray-600">
            Create your first segment to organize your audience
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segments.map((seg, index) => (
            <motion.div
              key={seg._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card group hover:shadow-medium transition-all duration-300"
            >
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                      <Tag className="w-4 h-4 text-primary-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">{seg.name}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEditingSegment(seg)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit Segment"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(seg._id)}
                      className="p-2 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                      title="Delete Segment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Filter className="w-4 h-4" />
                    <span>Filters Applied:</span>
                  </div>

                  {Object.keys(seg.filters || {}).length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      No filters applied
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(seg.filters || {}).map(([key, val]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {key}:
                          </span>
                          <span className="text-sm text-gray-900">
                            {Array.isArray(val)
                              ? val.join(", ")
                              : val.toString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SegmentManager;
