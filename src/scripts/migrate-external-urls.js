// Migration script to add default image field to existing ExternalUrl documents
// Run this with: node src/scripts/migrate-external-urls.js

const mongoose = require("mongoose");
require("dotenv").config();

const externalUrlSchema = new mongoose.Schema({
    url: { type: String, required: true },
    title: { type: String, required: true },
    sequence: { type: Number, required: true },
    urlParentId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    image: { type: String, required: false, default: null },
});

const ExternalUrl = mongoose.model("ExternalUrl", externalUrlSchema);

async function migrateExternalUrls() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Find all documents without image field
        const documentsWithoutImage = await ExternalUrl.find({
            image: { $exists: false },
        });

        console.log(
            `Found ${documentsWithoutImage.length} documents without image field`
        );

        if (documentsWithoutImage.length > 0) {
            // Update all documents to add image field with default value
            const result = await ExternalUrl.updateMany(
                { image: { $exists: false } },
                { $set: { image: null } }
            );

            console.log(`Updated ${result.modifiedCount} documents`);
        } else {
            console.log("No documents need updating");
        }

        console.log("Migration completed successfully");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

migrateExternalUrls();
