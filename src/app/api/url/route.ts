import { NextRequest, NextResponse } from "next/server";
import Url from "@/schema/Urls";
import { requireAuth } from "@/middlewares/auth";
import { verifyAccessToken } from "@/lib/jwt";
import ExternalUrl from "@/schema/ExternalUrl";

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const authResult: any = requireAuth(request as any);
        if (authResult?.status === 401) {
            return authResult; // Return error response if authentication fails
        }

        const userId = authResult.user.id;
        const urls = await Url.find({ userId: userId });
        return NextResponse.json(urls);
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
