const mongoose = require("mongoose");
require("dotenv").config();

// Define schemas with indexes
const urlSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    public: { type: Boolean },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    template: { type: Object, default: null },
    userAlias: { type: Object, default: null },
});

const externalUrlSchema = new mongoose.Schema({
    url: { type: String, required: true },
    title: { type: String, required: true },
    sequence: { type: Number, required: true },
    urlParentId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    image: { type: String, required: false, default: null },
});

// Add indexes
urlSchema.index({ userId: 1, createdAt: -1 });
urlSchema.index({ userId: 1, public: 1, createdAt: -1 });
urlSchema.index({ title: "text", description: "text" });
urlSchema.index({ userId: 1, public: 1 });

externalUrlSchema.index({ urlParentId: 1, sequence: 1 });

const Url = mongoose.model("Url", urlSchema);
const ExternalUrl = mongoose.model("ExternalUrl", externalUrlSchema);

async function createIndexes() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Create indexes for Url collection
        console.log("Creating indexes for Url collection...");
        await Url.collection.createIndex({ userId: 1, createdAt: -1 });
        await Url.collection.createIndex({
            userId: 1,
            public: 1,
            createdAt: -1,
        });
        await Url.collection.createIndex({
            title: "text",
            description: "text",
        });
        await Url.collection.createIndex({ userId: 1, public: 1 });
        console.log("Url indexes created successfully");

        // Create indexes for ExternalUrl collection
        console.log("Creating indexes for ExternalUrl collection...");
        await ExternalUrl.collection.createIndex({
            urlParentId: 1,
            sequence: 1,
        });
        console.log("ExternalUrl indexes created successfully");

        console.log("All indexes created successfully!");
    } catch (error) {
        console.error("Error creating indexes:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

createIndexes();
