import dotenv from "dotenv";
dotenv.config();

import cors from 'cors';
import express from "express";
import connectDB from "./config/db.js";
import listingRoutes from "./routes/listingRoutes.js";


const PORT = 8080;
const app = express();



connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/listings", listingRoutes);

app.listen(PORT, () =>{
    console.log(`Server is running on ${PORT}`);
})