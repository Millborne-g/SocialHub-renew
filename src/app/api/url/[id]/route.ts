import Url from "@/schema/Urls";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/middlewares/auth";
import ExternalUrl from "@/schema/ExternalUrl";
import connectMongo from "@/lib/mongodb";
import {
    uploadImageToCloudinary,
    deleteImageFromCloudinary,
    processExternalUrlImages,
    processExternalUrlImagesFromFiles,
    cleanupOldExternalUrlImages,
} from "@/lib/cloudinary";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectMongo();
        // Check authentication
        const authResult: any = requireAuth(request as any);
        if (authResult?.status === 401) {
            return authResult; // Return error response if authentication fails
        }
        const userId = (authResult as any).user.id;
        const { id } = await params;

        const url = await Url.findById(id);
        const externalUrls = await ExternalUrl.find({ urlParentId: id });

        return NextResponse.json({ url, externalUrls });
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching url" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication
        const authResult: any = requireAuth(request as any);
        if (authResult?.status === 401) {
            return authResult; // Return error response if authentication fails
        }
        const userId = (authResult as any).user.id;
        const { id } = await params;

        // Find the URL first to get image URLs before deleting
        const url = await Url.findById(id);
        if (!url) {
            return NextResponse.json(
                { message: "URL not found" },
                { status: 404 }
            );
        }

        // Check if user owns this URL
        if (url.userId !== userId) {
            return NextResponse.json(
                { message: "Unauthorized to delete this URL" },
                { status: 403 }
            );
        }

        // Delete images from Cloudinary if they exist
        if (url.image && url.image.startsWith("http")) {
            console.log("Deleting main image from Cloudinary:", url.image);
            await deleteImageFromCloudinary(url.image);
        }

        // Delete user alias image from Cloudinary if it exists
        if (
            url.userAlias?.imageFile &&
            url.userAlias.imageFile.startsWith("http")
        ) {
            console.log(
                "Deleting user alias image from Cloudinary:",
                url.userAlias.imageFile
            );
            await deleteImageFromCloudinary(url.userAlias.imageFile);
        }

        // Delete the URL from database
        await Url.findByIdAndDelete(id);

        // Delete associated external URLs
        const externalUrls = await ExternalUrl.find({ urlParentId: id });
        await ExternalUrl.deleteMany({ urlParentId: id });

        return NextResponse.json(
            { message: "Url deleted successfully", externalUrls },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting URL:", error);
        return NextResponse.json(
            { message: "Error deleting url" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Connect to MongoDB
        await connectMongo();

        // Check authentication
        const authResult: any = requireAuth(request as any);
        if (authResult?.status === 401) {
            return authResult; // Return error response if authentication fails
        }

        const userId = (authResult as any).user.id;
        const { id } = await params;

        // Check if URL exists and belongs to the user
        const existingUrl = await Url.findById(id);
        if (!existingUrl) {
            return NextResponse.json(
                { message: "URL not found" },
                { status: 404 }
            );
        }

        if (existingUrl.userId !== userId) {
            return NextResponse.json(
                { message: "Unauthorized to update this URL" },
                { status: 403 }
            );
        }

        // Handle FormData for file uploads (same as POST endpoint)
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const isPublic = formData.get("public") as string;
        const description = formData.get("description") as string;
        const image = formData.get("image") as File | null | string;
        const externalURLs = formData.get("externalURLs") as string;
        const template = formData.get("template") as any;
        const userAlias = formData.get("userAlias") as string;
        const userAliasImage = formData.get("userAliasImage") as File | null;
        // Validate required fields
        if (!title || title.trim() === "") {
            return NextResponse.json(
                { message: "Title is required" },
                { status: 400 }
            );
        }

        let imageUrl = existingUrl.image; // Keep existing image by default
        let oldImageUrl = existingUrl.image; // Store old image URL for potential deletion

        if (image === "null") {
            // Delete old image from Cloudinary if it exists when removing image
            if (oldImageUrl && oldImageUrl.startsWith("http")) {
                console.log(
                    "Deleting main image from Cloudinary (image being removed):",
                    oldImageUrl
                );
                await deleteImageFromCloudinary(oldImageUrl);
            }
            imageUrl = "";
        }

        // Handle image upload if new image is provided
        if (image && image instanceof File) {
            // Validate file size (Cloudinary has a 100MB limit, but we'll be conservative)
            const maxSize = 10 * 1024 * 1024; // 10MB limit
            if (image.size > maxSize) {
                return NextResponse.json(
                    { error: "Image size too large. Maximum size is 10MB." },
                    { status: 400 }
                );
            }

            // Validate file type
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
            ];
            if (!allowedTypes.includes(image.type)) {
                return NextResponse.json(
                    {
                        error: "Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed.",
                    },
                    { status: 400 }
                );
            }

            try {
                // Upload image to Cloudinary in 'url-images' subfolder
                imageUrl = await uploadImageToCloudinary(image, "url-images");

                // Delete old image from Cloudinary if it exists and is different from new one
                if (
                    oldImageUrl &&
                    oldImageUrl !== imageUrl &&
                    oldImageUrl.startsWith("http")
                ) {
                    console.log(
                        "Deleting old main image from Cloudinary:",
                        oldImageUrl
                    );
                    await deleteImageFromCloudinary(oldImageUrl);
                }
            } catch (error) {
                console.error("Error uploading image to Cloudinary:", error);
                return NextResponse.json(
                    { error: "Failed to upload image. Please try again." },
                    { status: 500 }
                );
            }
        }

        // Handle userAlias image upload
        let userAliasImageUrl = "";
        let oldUserAliasImageUrl = existingUrl.userAlias?.imageFile || ""; // Store old user alias image URL

        if (userAliasImage && userAliasImage instanceof File) {
            // Validate file size (Cloudinary has a 100MB limit, but we'll be conservative)
            const maxSize = 10 * 1024 * 1024; // 10MB limit
            if (userAliasImage.size > maxSize) {
                return NextResponse.json(
                    {
                        error: "User alias image size too large. Maximum size is 10MB.",
                    },
                    { status: 400 }
                );
            }

            // Validate file type
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
            ];
            if (!allowedTypes.includes(userAliasImage.type)) {
                return NextResponse.json(
                    {
                        error: "Invalid user alias image type. Only JPEG, PNG, GIF, and WebP are allowed.",
                    },
                    { status: 400 }
                );
            }

            try {
                // Upload user alias image to Cloudinary in 'user-alias-image' subfolder
                userAliasImageUrl = await uploadImageToCloudinary(
                    userAliasImage,
                    "user-alias-image"
                );

                // Delete old user alias image from Cloudinary if it exists and is different from new one
                if (
                    oldUserAliasImageUrl &&
                    oldUserAliasImageUrl !== userAliasImageUrl &&
                    oldUserAliasImageUrl.startsWith("http")
                ) {
                    console.log(
                        "Deleting old user alias image from Cloudinary:",
                        oldUserAliasImageUrl
                    );
                    await deleteImageFromCloudinary(oldUserAliasImageUrl);
                }
            } catch (error) {
                console.error(
                    "Error uploading user alias image to Cloudinary:",
                    error
                );
                return NextResponse.json(
                    {
                        error: "Failed to upload user alias image. Please try again.",
                    },
                    { status: 500 }
                );
            }
        }

        // Parse userAlias and update with processed image
        let userAliasData = null;
        try {
            userAliasData = userAlias ? JSON.parse(userAlias) : null;
        } catch (parseError) {
            console.error("Error parsing userAlias:", parseError);
            userAliasData = null;
        }

        if (userAliasData) {
            if (userAliasImageUrl) {
                userAliasData.imageFile = userAliasImageUrl;
            } else if (
                userAliasData.imageFile === null ||
                userAliasData.imageFile === ""
            ) {
                // If userAlias image is being removed, delete old image from Cloudinary
                if (
                    oldUserAliasImageUrl &&
                    oldUserAliasImageUrl.startsWith("http")
                ) {
                    console.log(
                        "Deleting user alias image from Cloudinary (image being removed):",
                        oldUserAliasImageUrl
                    );
                    await deleteImageFromCloudinary(oldUserAliasImageUrl);
                }
            }
        } else {
            // If userAlias is being completely removed, delete old image from Cloudinary
            if (
                oldUserAliasImageUrl &&
                oldUserAliasImageUrl.startsWith("http")
            ) {
                console.log(
                    "Deleting user alias image from Cloudinary (userAlias being removed):",
                    oldUserAliasImageUrl
                );
                await deleteImageFromCloudinary(oldUserAliasImageUrl);
            }
        }

        // Update the URL
        const updatedUrl = await Url.findByIdAndUpdate(
            id,
            {
                title: title.trim(),
                description: description?.trim() || "",
                image: imageUrl,
                public: isPublic === "true",
                template: JSON.parse(template),
                userAlias: userAliasData,
                updatedAt: new Date(),
            },
            { new: true, runValidators: true }
        );

        // Handle external URLs if provided
        if (externalURLs) {
            try {
                const externalURLsArray = JSON.parse(externalURLs);

                // Get existing external URLs before deleting them
                const existingExternalURLs = await ExternalUrl.find({
                    urlParentId: id,
                });

                // Delete existing external URLs for this URL
                await ExternalUrl.deleteMany({ urlParentId: id });

                // Create new external URLs
                if (externalURLsArray.length > 0) {
                    // Process external URL images from separate file uploads
                    const processedExternalURLs =
                        await processExternalUrlImagesFromFiles(
                            externalURLsArray,
                            formData
                        );

                    const externalUrlData = processedExternalURLs.map(
                        (item: any) => ({
                            url: item.url,
                            title: item.title,
                            sequence: item.sequence,
                            urlParentId: id,
                            image: item.image,
                        })
                    );

                    await ExternalUrl.create(externalUrlData);

                    // Clean up old external URL images from Cloudinary
                    await cleanupOldExternalUrlImages(
                        existingExternalURLs,
                        processedExternalURLs
                    );
                } else {
                    // If no new external URLs, clean up all old images
                    await cleanupOldExternalUrlImages(existingExternalURLs, []);
                }
            } catch (parseError) {
                console.error("Error parsing external URLs:", parseError);
                return NextResponse.json(
                    { message: "Invalid external URLs format" },
                    { status: 400 }
                );
            }
        }

        // Fetch updated external URLs
        const externalUrls = await ExternalUrl.find({ urlParentId: id }).sort({
            sequence: 1,
        });

        return NextResponse.json({
            message: "URL updated successfully",
            url: updatedUrl,
            externalUrls,
        });
    } catch (error) {
        console.error("Error updating URL:", error);
        return NextResponse.json(
            { message: "Error updating URL" },
            { status: 500 }
        );
    }
}
