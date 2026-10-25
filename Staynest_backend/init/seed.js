import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import sampleListings from "./data.js";  
import Listing from "../models/listing.js";  
import ConnectDB from "../config/db.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const initDB = async () => {
  try {
    // 1. 
    await ConnectDB();

    await Listing.deleteMany({});
    const rawData = Array.isArray(sampleListings) 
      ? sampleListings 
      : sampleListings.data;

    const dataToInsert = rawData.map((obj) => ({
      ...obj,
      owner: "65c2b8f8e4b0a1b2c3d4e5f6", 
    }));
    await Listing.insertMany(dataToInsert);
    console.log("Database initialized with sample listings!");
  } catch (err) {
    console.error("Error seeding the database:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Disconnected from DB.");
  }
};

initDB();
