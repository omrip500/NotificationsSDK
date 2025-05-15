import User from "../models/User.js";

const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    return res.status(401).json({ message: "API key missing" });
  }

  const user = await User.findOne({ apiKey });

  if (!user) {
    return res.status(403).json({ message: "Invalid API key" });
  }

  // Save user info for use in routes if needed
  req.user = user;
  next();
};

export default authenticateApiKey;
