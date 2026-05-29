import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config();
let isConnected=false;
const connectDb=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Databse connected succesfully");
    }catch(error){
        console.error("DB Error:", error.message);
        process.exit(1);
    }
}

export default  connectDb;
