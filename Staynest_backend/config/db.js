import mongoose from "mongoose";

const connectDB = async() =>{
    try{

        const connection = await mongoose.connect(process.env.MONGODB_URL);
        console.log("Mongodb Connected Successfully");

    } catch(error){
        console.log(error.message);
    }

}

export default connectDB;
