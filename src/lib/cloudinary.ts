import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper function to upload image to Cloudinary
export const uploadImageToCloudinary = async (
    file: File,
    subfolder?: string
): Promise<string> => {
    try {
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Convert buffer to base64 string
        const base64String = buffer.toString("base64");
        const dataUri = `data:${file.type};base64,${base64String}`;

        // Build folder path
        const folderPath = subfolder ? `LinkLet/${subfolder}` : "LinkLet";

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataUri, {
            resource_type: "auto",
            folder: folderPath,
            quality: "auto",
            fetch_format: "auto",
        });

        return result.secure_url;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        throw new Error("Failed to upload image to Cloudinary");
    }
};

// Helper function to delete image from Cloudinary
export const deleteImageFromCloudinary = async (
    imageUrl: string
): Promise<void> => {
    try {
        console.log("Original image URL:", imageUrl);

        // Extract public ID from Cloudinary URL
        // Cloudinary URLs format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
        const urlParts = imageUrl.split("/");
        const uploadIndex = urlParts.findIndex((part) => part === "upload");

        if (uploadIndex === -1 || uploadIndex >= urlParts.length - 1) {
            console.warn("Invalid Cloudinary URL format:", imageUrl);
            return;
        }

        // Get the path after 'upload' (includes version and folder/filename)
        const pathAfterUpload = urlParts.slice(uploadIndex + 1).join("/");
        console.log("Path after upload:", pathAfterUpload);

        // Remove version number if present (v1234567890/)
        const publicId = pathAfterUpload.replace(/^v\d+\//, "");
        console.log("Public ID to delete:", publicId);

        // Also try without the file extension for some Cloudinary setups
        const publicIdWithoutExtension = publicId.replace(/\.[^/.]+$/, "");
        console.log("Public ID without extension:", publicIdWithoutExtension);

        // Try to get the actual public ID from Cloudinary using the URL
        try {
            const resourceInfo = await cloudinary.api.resource(publicId, {
                resource_type: "image",
            });
            console.log("Found resource info:", resourceInfo);
        } catch (error) {
            console.log(
                "Could not fetch resource info:",
                error instanceof Error ? error.message : String(error)
            );
        }

        // Try different approaches to delete
        let result;
        let success = false;

        // Try different public ID formats and resource types
        const publicIdVariants = [publicId, publicIdWithoutExtension];
        const resourceTypes = ["image", "auto"];

        for (const variant of publicIdVariants) {
            for (const resourceType of resourceTypes) {
                try {
                    console.log(
                        `Trying to delete with publicId: "${variant}", resource_type: "${resourceType}"`
                    );
                    result = await cloudinary.uploader.destroy(variant, {
                        resource_type: resourceType,
                    });
                    console.log(
                        `Delete result (${variant}, ${resourceType}):`,
                        result
                    );

                    if (result.result === "ok") {
                        console.log(
                            "Successfully deleted image from Cloudinary:",
                            variant
                        );
                        success = true;
                        break;
                    }
                } catch (error) {
                    console.log(
                        `Failed with publicId: "${variant}", resource_type: "${resourceType}":`,
                        error instanceof Error ? error.message : String(error)
                    );
                }
            }
            if (success) break;
        }

        if (!success) {
            console.warn(
                "Failed to delete image from Cloudinary with all methods"
            );
        }
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        // Don't throw error to prevent deletion failure if Cloudinary deletion fails
    }
};
