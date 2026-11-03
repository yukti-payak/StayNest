import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import sampleListings from "./data.js";  
import Listing from "../models/Listing.js";  
import ConnectDB from "../config/db.js";

// Load .env file correctly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const initDB = async () => {
  try {
    // 1. Connect to Database
    await ConnectDB();

    // 2. Clear existing listings
    await Listing.deleteMany({});

    // 3. Extract raw data safely (handles both direct array or { data: [...] })
    const rawData = Array.isArray(sampleListings) 
      ? sampleListings 
      : sampleListings?.data || [];

    if (rawData.length === 0) {
      console.log("No sample listings found in data.js!");
      return;
    }

    // 4. Map data and ensure a valid ObjectId is assigned to 'owner'
    const defaultOwnerId = new mongoose.Types.ObjectId("6aea07652ef122e1fd1913e2");

    const dataToInsert = rawData.map((obj) => ({
      ...obj,
      owner: obj.owner ? new mongoose.Types.ObjectId(obj.owner) : defaultOwnerId,
    }));

    // 5. Insert into MongoDB
    await Listing.insertMany(dataToInsert);
    console.log("Database initialized successfully with sample listings and owner ID!");
  } catch (err) {
    console.error("Error seeding the database:", err);
  } finally {
    // 6. Close connection safely
    await mongoose.connection.close();
    console.log("Disconnected from DB.");
  }
};

initDB();