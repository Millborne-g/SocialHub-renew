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
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },

    views: {
        type: Number,
        default: 0,
    },
});

// Clear existing model to force schema update
if (mongoose.models.Url) {
    delete mongoose.models.Url;
}

const Url = mongoose.model("Url", urlSchema);

export default Url;
