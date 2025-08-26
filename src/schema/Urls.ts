import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
    public: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Clear existing model to force schema update
if (mongoose.models.Url) {
    delete mongoose.models.Url;
}

const Url = mongoose.model("Url", urlSchema);

export default Url;
