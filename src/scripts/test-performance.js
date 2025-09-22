const mongoose = require("mongoose");
require("dotenv").config();

// Simple performance test script
async function testPerformance() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const Url = mongoose.model(
            "Url",
            new mongoose.Schema({}, { strict: false })
        );
        const ExternalUrl = mongoose.model(
            "ExternalUrl",
            new mongoose.Schema({}, { strict: false })
        );

        // Test query performance
        console.log("\n=== Performance Test ===");

        const startTime = Date.now();

        // Test 1: Count documents
        const countStart = Date.now();
        const total = await Url.countDocuments({});
        const countTime = Date.now() - countStart;
        console.log(`Count query: ${countTime}ms (${total} documents)`);

        // Test 2: Find with pagination
        const findStart = Date.now();
        const urls = await Url.find({})
            .skip(0)
            .limit(10)
            .sort({ createdAt: -1 });
        const findTime = Date.now() - findStart;
        console.log(`Find query: ${findTime}ms (${urls.length} documents)`);

        // Test 3: External URLs query
        if (urls.length > 0) {
            const urlIds = urls.map((url) => url._id.toString());
            const externalStart = Date.now();
            const externalUrls = await ExternalUrl.find({
                urlParentId: { $in: urlIds },
            });
            const externalTime = Date.now() - externalStart;
            console.log(
                `External URLs query: ${externalTime}ms (${externalUrls.length} documents)`
            );
        }

        const totalTime = Date.now() - startTime;
        console.log(`\nTotal test time: ${totalTime}ms`);

        // Check indexes
        console.log("\n=== Index Information ===");
        const urlIndexes = await Url.collection.getIndexes();
        console.log("Url collection indexes:", Object.keys(urlIndexes).length);

        const externalUrlIndexes = await ExternalUrl.collection.getIndexes();
        console.log(
            "ExternalUrl collection indexes:",
            Object.keys(externalUrlIndexes).length
        );
    } catch (error) {
        console.error("Performance test failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\nDisconnected from MongoDB");
    }
}

testPerformance();
