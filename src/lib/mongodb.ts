import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URL;

const connectMongo = async () => {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log(error);
    }
}

export default connectMongo;