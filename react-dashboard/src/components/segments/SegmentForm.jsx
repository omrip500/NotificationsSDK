import { useState, useEffect } from "react";
import api from "../../services/api";
import "./SegmentForm.css";

const interestsOptions = [
  "sports",
  "politics",
  "tech",
  "beauty",
  "health",
  "food",
  "finance",
  "education",
];

function SegmentForm({
  appId,
  editMode = false,
  initialValues = {},
  onSegmentCreated,
  onUpdate,
  onCancel,
}) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);

  useEffect(() => {
    if (editMode && initialValues) {
      setName(initialValues.name || "");
      setGender(initialValues.filters?.gender || "");
      setAgeMin(initialValues.filters?.ageMin || "");
      setAgeMax(initialValues.filters?.ageMax || "");
      setSelectedInterests(initialValues.filters?.interests || []);
    }
  }, [editMode, initialValues]);

  const handleCheckboxChange = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const filters = {
      gender: gender || undefined,
      ageMin: ageMin ? Number(ageMin) : undefined,
      ageMax: ageMax ? Number(ageMax) : undefined,
      interests: selectedInterests,
    };

    try {
      if (editMode && initialValues._id) {
        const updatedSegment = {
          _id: initialValues._id,
          appId,
          name,
          filters,
        };
        if (onUpdate) onUpdate(updatedSegment);
      } else {
        await api.post(
          "/segments",
          { appId, name, filters },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (onSegmentCreated) onSegmentCreated();
      }

      setName("");
      setGender("");
      setAgeMin("");
      setAgeMax("");
      setSelectedInterests([]);
    } catch (err) {
      console.error("❌ Failed to save segment", err);
      alert("Failed to save segment");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="segment-form">
      <h3>{editMode ? "Edit Segment" : "Create New Segment"}</h3>

      <label>Segment Name:</label>
      <input
        type="text"
        placeholder="Segment Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <label>Gender (optional):</label>
      <select value={gender} onChange={(e) => setGender(e.target.value)}>
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      <label>Min Age (optional):</label>
      <input
        type="number"
        placeholder="Min Age"
        value={ageMin}
        onChange={(e) => setAgeMin(e.target.value)}
      />

      <label>Max Age (optional):</label>
      <input
        type="number"
        placeholder="Max Age"
        value={ageMax}
        onChange={(e) => setAgeMax(e.target.value)}
      />

      <label>Select Interests:</label>
      <div className="interests-list">
        {interestsOptions.map((interest) => (
          <label key={interest}>
            <input
              type="checkbox"
              checked={selectedInterests.includes(interest)}
              onChange={() => handleCheckboxChange(interest)}
            />
            {interest}
          </label>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button type="submit">
          {editMode ? "Update Segment" : "Create Segment"}
        </button>
        {editMode && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{ background: "#e2e8f0", color: "#1e293b" }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default SegmentForm;
