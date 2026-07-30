import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/db.js";


const PORT = 8080;
const app = express();



connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () =>{
    console.log(`Server is running on ${PORT}`);
})