import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser'; // 1. Import cookie-parser
import connectDB from "./config/db.js";
import listingRoutes from "./routes/listingRoutes.js";
import authRoutes from './routes/authRoutes.js';

const PORT = 8080;
const app = express();

connectDB();

// 2. Allow credentials and point to your frontend domain/port
app.use(cors({
  origin: "http://localhost:5173", // Replace with your frontend URL
  credentials: true
}));

app.use(cookieParser()); // 3. Add cookie-parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});