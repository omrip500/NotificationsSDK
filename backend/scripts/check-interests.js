import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Check interests for a specific app
const checkInterests = async () => {
  try {
    const appId = "68481f3a6f6558db1726e9fb";
    console.log(`🔍 Checking interests for app: ${appId}`);
    
    const app = await mongoose.connection.db.collection('applications').findOne({ _id: new mongoose.Types.ObjectId(appId) });
    
    if (app) {
      console.log(`📱 App name: ${app.name}`);
      console.log(`🎯 Interests:`, app.interests || []);
    } else {
      console.log("❌ App not found");
    }
    
  } catch (error) {
    console.error("❌ Error checking interests:", error.message);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await checkInterests();
  
  console.log("🏁 Check completed. Closing database connection...");
  await mongoose.connection.close();
  console.log("👋 Database connection closed.");
  process.exit(0);
};

// Run the script
main().catch((error) => {
  console.error("❌ Script failed:", error.message);
  process.exit(1);
});
