import { NextRequest, NextResponse } from "next/server";
import Url from "@/schema/Urls";
import { requireAuth } from "@/middlewares/auth";
import ExternalUrl from "@/schema/ExternalUrl";
import connectMongo from "@/lib/mongodb";

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

        // Fetch ExternalUrl data for each URL
        const urlsWithExternalUrls = await Promise.all(
            urls.map(async (url) => {
                const externalUrls = await ExternalUrl.find({
                    urlParentId: url._id.toString(),
                }).sort({ sequence: 1 }); // Sort by sequence number

                return {
                    ...url.toObject(),
                    externalUrls,
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

        // Handle FormData for file uploads
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const isPublic = formData.get("public") as string;
        const description = formData.get("description") as string;
        const image = formData.get("image") as File | null;
        const externalURLs = formData.get("externalURLs") as string;
        const userId = (authResult as any).user.id;
        let imageUrl = "";

        // Handle image upload
        if (image && image instanceof File) {
            // Validate file size (MongoDB document limit is 16MB, but we'll be conservative)
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
                // Convert to base64 and store as string
                const bytes = await image.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const base64 = `data:${image.type};base64,${buffer.toString(
                    "base64"
                )}`;
                imageUrl = base64;
            } catch (error) {
                console.error("Error processing image:", error);
                return NextResponse.json(
                    { error: "Failed to process image. Please try again." },
                    { status: 500 }
                );
            }
        }

        const createdUrl = await Url.create({
            userId,
            title,
            description,
            image: imageUrl,
            public: isPublic === "true",
        });

        const externalURLsArray = JSON.parse(externalURLs);

        const externalUrlData = externalURLsArray.map((item: any) => ({
            url: item.url,
            title: item.title,
            sequence: item.sequence,
            urlParentId: createdUrl._id.toString(),
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
