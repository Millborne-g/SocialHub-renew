import mongoose from "mongoose";

const externalUrlSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    sequence: {
        type: Number,
        required: true,
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

const ExternalUrl = mongoose.models.ExternalUrl || mongoose.model("ExternalUrl", externalUrlSchema);

export default ExternalUrl;