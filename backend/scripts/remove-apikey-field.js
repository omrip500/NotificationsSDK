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

// Remove apiKey field from all users
const removeApiKeyField = async () => {
  try {
    console.log("🔄 Starting to remove apiKey field from all users...");

    // First, try to drop the unique index on apiKey field
    try {
      console.log("🗑️ Attempting to drop apiKey unique index...");
      await mongoose.connection.db.collection("users").dropIndex("apiKey_1");
      console.log("✅ Successfully dropped apiKey unique index");
    } catch (indexError) {
      console.log(
        "ℹ️ apiKey index might not exist or already dropped:",
        indexError.message
      );
    }

    // Update all users to remove the apiKey field
    const result = await mongoose.connection.db.collection("users").updateMany(
      {}, // Empty filter to match all documents
      { $unset: { apiKey: "" } } // Remove the apiKey field
    );

    console.log(
      `✅ Successfully removed apiKey field from ${result.modifiedCount} users`
    );
    console.log(`📊 Total users checked: ${result.matchedCount}`);

    // Verify the changes
    const usersWithApiKey = await mongoose.connection.db
      .collection("users")
      .countDocuments({ apiKey: { $exists: true } });
    console.log(`🔍 Users still with apiKey field: ${usersWithApiKey}`);

    if (usersWithApiKey === 0) {
      console.log("🎉 All apiKey fields have been successfully removed!");
    } else {
      console.log(
        "⚠️ Some users still have the apiKey field. Please check manually."
      );
    }
  } catch (error) {
    console.error("❌ Error removing apiKey field:", error.message);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await removeApiKeyField();

  console.log("🏁 Script completed. Closing database connection...");
  await mongoose.connection.close();
  console.log("👋 Database connection closed.");
  process.exit(0);
};

// Run the script
main().catch((error) => {
  console.error("❌ Script failed:", error.message);
  process.exit(1);
});
