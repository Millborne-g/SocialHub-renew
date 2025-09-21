import Url from "@/schema/Urls";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/middlewares/auth";
import ExternalUrl from "@/schema/ExternalUrl";
import connectMongo from "@/lib/mongodb";

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
        const url = await Url.findByIdAndDelete(id);
        const externalUrls = await ExternalUrl.find({ urlParentId: id });
        await ExternalUrl.deleteMany({ urlParentId: id });
        return NextResponse.json(
            { message: "Url deleted successfully", externalUrls },
            { status: 200 }
        );
    } catch (error) {
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

        if (image === "null") {
            imageUrl = "";
        }

        // Handle image upload if new image is provided
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

        // Handle userAlias image upload
        let userAliasImageUrl = "";
        if (userAliasImage && userAliasImage instanceof File) {
            // Validate file size (MongoDB document limit is 16MB, but we'll be conservative)
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
                // Convert to base64 and store as string
                const bytes = await userAliasImage.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const base64 = `data:${
                    userAliasImage.type
                };base64,${buffer.toString("base64")}`;
                userAliasImageUrl = base64;
            } catch (error) {
                console.error("Error processing user alias image:", error);
                return NextResponse.json(
                    {
                        error: "Failed to process user alias image. Please try again.",
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

                // Delete existing external URLs for this URL
                await ExternalUrl.deleteMany({ urlParentId: id });

                // Create new external URLs
                if (externalURLsArray.length > 0) {
                    const externalUrlData = externalURLsArray.map(
                        (item: any) => ({
                            url: item.url,
                            title: item.title,
                            sequence: item.sequence,
                            urlParentId: id,
                            image: item.image,
                        })
                    );

                    await ExternalUrl.create(externalUrlData);
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
