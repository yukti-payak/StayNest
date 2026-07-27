import dotenv from "dotenv";
dotenv.config();

import express from "express";
const PORT = 8080;
const app = express();
import connectDB from "./config/db.js";


connectDB();

app.listen(PORT, () =>{
    console.log(`Server is running on ${PORT}`);
})