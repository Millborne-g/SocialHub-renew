import mongoose from "mongoose";

const connectMongo = async () => {
      try {
        console.log("******************************");
        console.log(process.env.MONGODB_URI);
        console.log("******************************");
        
        await mongoose.connect(process.env.MONGODB_URI || "");
        console.log("Connected to MongoDB");
      } catch (error) {
        console.log(error);
    }
};

export default connectMongo;
