import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

// Import models
import Application from "../src/models/Application.js";
import Device from "../src/models/Device.js";

async function migrateExistingApps() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find applications without clientId
    const appsWithoutClientId = await Application.find({
      $or: [
        { clientId: { $exists: false } },
        { clientId: null },
        { clientId: "" }
      ]
    });

    console.log(`📋 Found ${appsWithoutClientId.length} applications without clientId`);

    for (const app of appsWithoutClientId) {
      // Generate unique clientId
      const clientId = `legacy-${uuidv4()}`;
      
      // Update application
      await Application.findByIdAndUpdate(app._id, { clientId });
      console.log(`✅ Updated app "${app.name}" with clientId: ${clientId}`);

      // Update all devices for this app
      const devicesUpdated = await Device.updateMany(
        { 
          appId: app._id,
          $or: [
            { clientId: { $exists: false } },
            { clientId: null },
            { clientId: "" }
          ]
        },
        { clientId }
      );

      console.log(`📱 Updated ${devicesUpdated.modifiedCount} devices for app "${app.name}"`);
    }

    console.log("🎉 Migration completed successfully!");
    
    // Show summary
    const totalApps = await Application.countDocuments();
    const appsWithClientId = await Application.countDocuments({ 
      clientId: { $exists: true, $ne: null, $ne: "" } 
    });
    
    console.log(`📊 Summary:`);
    console.log(`   Total applications: ${totalApps}`);
    console.log(`   Applications with clientId: ${appsWithClientId}`);

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run migration
migrateExistingApps();
