import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import sampleListings from "./data.js";  
import Listing from "../models/listing.js";  
import ConnectDB from "../config/db.js";

// Load .env file from the root 'Staynest_backend' directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const initDB = async () => {
  try {
    // 1. Wait for database connection to complete
    await ConnectDB();

    // 2. Clear existing listings
    await Listing.deleteMany({});

    // 3. Extract array if exported as { data: [...] } or array directly
    const rawData = Array.isArray(sampleListings) 
      ? sampleListings 
      : sampleListings.data;

    // 4. Map through the data and inject the required owner field
    const dataToInsert = rawData.map((obj) => ({
      ...obj,
      // ⚠️ REPLACE THIS STRING WITH A VALID USER ID FROM YOUR ATLAS USERS COLLECTION
      owner: "65c2b8f8e4b0a1b2c3d4e5f6", 
    }));

    // 5. Seed database
    await Listing.insertMany(dataToInsert);
    console.log("Database initialized with sample listings!");
  } catch (err) {
    console.error("Error seeding the database:", err);
  } finally {
    // 6. Safely close connection when complete
    await mongoose.connection.close();
    console.log("Disconnected from DB.");
  }
};

initDB();
