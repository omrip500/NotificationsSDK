import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, User, Heart, X, Check } from "lucide-react";
import api from "../../services/api";

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
  const [availableInterests, setAvailableInterests] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(true);

  // טעינת אינטרסים מהשרת
  useEffect(() => {
    const loadInterests = async () => {
      try {
        setLoadingInterests(true);
        const token = localStorage.getItem("token");
        const response = await api.get(`/applications/${appId}/interests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailableInterests(response.data.interests || []);
      } catch (error) {
        console.error("Failed to load interests:", error);
        // במקרה של שגיאה, נשתמש ברשימה ברירת מחדל
        setAvailableInterests(["sports", "technology", "breaking_news", "weather"]);
      } finally {
        setLoadingInterests(false);
      }
    };

    if (appId) {
      loadInterests();
    }
  }, [appId]);

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
        const response = await api.post(
          "/segments",
          { appId, name, filters },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("✅ SegmentForm: Segment created successfully:", response.data);
        if (onSegmentCreated) {
          console.log("🔄 SegmentForm: Calling onSegmentCreated callback...");
          onSegmentCreated();
        }
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card max-w-2xl mx-auto"
    >
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {editMode ? "Edit Segment" : "Create New Segment"}
            </h3>
            <p className="text-sm text-gray-600">
              Define criteria to target specific user groups
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-body space-y-6">
        {/* Segment Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Segment Name
          </label>
          <input
            type="text"
            placeholder="Enter a descriptive name for your segment"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            required
          />
        </div>

        {/* Demographics Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h4 className="text-md font-medium text-gray-900">Demographics</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender (optional)
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="input"
              >
                <option value="">Any Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Age (optional)
              </label>
              <input
                type="number"
                placeholder="18"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
                className="input"
                min="0"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Age (optional)
              </label>
              <input
                type="number"
                placeholder="65"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
                className="input"
                min="0"
                max="120"
              />
            </div>
          </div>
        </div>

        {/* Interests Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-gray-600" />
            <h4 className="text-md font-medium text-gray-900">Interests</h4>
          </div>

          {loadingInterests ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Loading interests...</span>
            </div>
          ) : availableInterests.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No interests configured
              </h3>
              <p className="text-gray-600">
                Configure interests in the "Manage Interests" tab first
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableInterests.map((interest) => (
              <motion.label
                key={interest}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedInterests.includes(interest)
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedInterests.includes(interest)}
                  onChange={() => handleCheckboxChange(interest)}
                  className="sr-only"
                />
                <span className="text-sm font-medium capitalize">
                  {interest}
                </span>
                {selectedInterests.includes(interest) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </motion.label>
              ))}
            </div>
          )}

          {selectedInterests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 p-3 bg-primary-50 rounded-lg"
            >
              <p className="text-sm text-primary-700">
                <strong>Selected interests:</strong>{" "}
                {selectedInterests.join(", ")}
              </p>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          {editMode && onCancel && (
            <motion.button
              type="button"
              onClick={onCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </motion.button>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {editMode ? "Update Segment" : "Create Segment"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

export default SegmentForm;
