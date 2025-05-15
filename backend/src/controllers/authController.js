import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Helper function to generate a unique API key
const generateApiKey = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = generateApiKey();

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      apiKey,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      apiKey,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

// Login existing user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      apiKey: user.apiKey,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};
