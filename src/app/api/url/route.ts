import { NextRequest, NextResponse } from "next/server";
import Url from "@/schema/Urls";
import { requireAuth } from "@/middlewares/auth";
import ExternalUrl from "@/schema/ExternalUrl";
import connectMongo from "@/lib/mongodb";
import {
    uploadImageToCloudinary,
    processExternalUrlImages,
    processExternalUrlImagesFromFiles,
} from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
    try {
        await connectMongo();
        // Check authentication
        const authResult: any = requireAuth(request as any);
        if (authResult?.status === 401) {
            return authResult; // Return error response if authentication fails
        }

        const userId = authResult.user.id;

        // Get query parameters for pagination and filtering
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const filter = searchParams.get("filter") || "all";
        const search = searchParams.get("search") || "";

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Build query object
        let query: any = { userId: userId };

        // Apply filter for public/private
        if (filter === "public") {
            query.public = true;
        } else if (filter === "private") {
            query.public = false;
        }
        // If filter is "all", no additional filtering is applied

        // Apply search filter if search term is provided
        if (search.trim()) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        // Get total count of URLs for the user with filter
        const total = await Url.countDocuments(query);

        // Get paginated URLs with filter
        const urls = await Url.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Sort by creation date, newest first

        // Fetch ExternalUrl count for each URL
        const urlsWithExternalUrls = await Promise.all(
            urls.map(async (url) => {
                const externalUrlsCount = await ExternalUrl.countDocuments({
                    urlParentId: url._id.toString(),
                });

                return {
                    ...url.toObject(),
                    externalUrlsCount,
                };
            })
        );

        return NextResponse.json({
            urls: urlsWithExternalUrls,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching urls" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const authResult = requireAuth(request as any);
        if (authResult?.status === 401) {
            return authResult; // Return error response if authentication fails
        }

        await connectMongo();

        // Handle FormData for file uploads
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const isPublic = formData.get("public") as string;
        const description = formData.get("description") as string;
        const image = formData.get("image") as File | null;
        const externalURLs = formData.get("externalURLs") as string;
        const userId = (authResult as any).user.id;
        const template = formData.get("template") as string;
        const userAlias = formData.get("userAlias") as string;
        let imageUrl = "";

        // Handle image upload
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
                // Upload image to Cloudinary in 'main-images' subfolder
                imageUrl = await uploadImageToCloudinary(image, "url-images");
            } catch (error) {
                console.error("Error uploading image to Cloudinary:", error);
                return NextResponse.json(
                    { error: "Failed to upload image. Please try again." },
                    { status: 500 }
                );
            }
        }

        // Handle image upload user alias
        let userAliasImageUrl = "";
        const userAliasImage = formData.get("userAliasImage") as File | null;
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
                // Upload user alias image to Cloudinary in 'user-avatars' subfolder
                userAliasImageUrl = await uploadImageToCloudinary(
                    userAliasImage,
                    "user-alias-image"
                );
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
        const userAliasData = JSON.parse(userAlias);
        if (userAliasImageUrl) {
            userAliasData.imageFile = userAliasImageUrl;
        }

        const createdUrl = await Url.create({
            userId,
            title,
            description,
            image: imageUrl,
            public: isPublic === "true",
            template: JSON.parse(template),
            userAlias: userAliasData,
        });

        const externalURLsArray = JSON.parse(externalURLs);

        // Process external URL images from separate file uploads
        const processedExternalURLs = await processExternalUrlImagesFromFiles(
            externalURLsArray,
            formData
        );

        const externalUrlData = processedExternalURLs.map((item: any) => ({
            url: item.url,
            title: item.title,
            sequence: item.sequence,
            urlParentId: createdUrl._id.toString(),
            image: item.image,
        }));

        await ExternalUrl.create(externalUrlData);

        return NextResponse.json(createdUrl);
    } catch (error) {
        console.error("Error saving url:", error);
        return NextResponse.json(
            { message: "Error saving url" },
            { status: 500 }
        );
    }
}
