import { useEffect, useState } from "react";
import api from "../../services/api";
import "./SegmentManager.css";
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
    <div className="segment-manager">
      <h3>Saved Segments</h3>

      {editingSegment && (
        <SegmentForm
          appId={appId}
          editMode
          initialValues={editingSegment}
          onUpdate={handleUpdate}
          onCancel={() => setEditingSegment(null)}
        />
      )}

      {loading ? (
        <p>Loading segments...</p>
      ) : segments.length === 0 ? (
        <p>No segments created yet.</p>
      ) : (
        <table className="segments-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Filters</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((seg) => (
              <tr key={seg._id}>
                <td>{seg.name}</td>
                <td>
                  {Object.entries(seg.filters || {}).map(([key, val]) => (
                    <div key={key}>
                      <strong>{key}</strong>:{" "}
                      {Array.isArray(val) ? val.join(", ") : val.toString()}
                    </div>
                  ))}
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => setEditingSegment(seg)}
                  >
                    Edit
                  </button>{" "}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(seg._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SegmentManager;
