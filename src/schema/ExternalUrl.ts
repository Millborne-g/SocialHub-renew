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
    urlParentId: {
        type: String,
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
    image: {
        type: String,
        required: false,
        default: null,
    },
});

const ExternalUrl =
    mongoose.models.ExternalUrl ||
    mongoose.model("ExternalUrl", externalUrlSchema);

export default ExternalUrl;
