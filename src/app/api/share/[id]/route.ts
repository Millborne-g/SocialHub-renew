import Url from "@/schema/Urls";
import { NextRequest, NextResponse } from "next/server";
import ExternalUrl from "@/schema/ExternalUrl";
import User from "@/schema/Users";
import connectMongo from "@/lib/mongodb";
import { verifyAccessToken } from "@/lib/jwt";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectMongo();

        const { id } = await params;

        const url = await Url.findById(id);
        if (!url) {
            return NextResponse.json(
                { message: "Url not found" },
                { status: 404 }
            );
        }

        // Check if URL is private
        if (url.public === false) {
            // Get authorization token from headers
            const authHeader = request.headers.get("authorization");
            if (!authHeader) {
                return NextResponse.json(
                    { message: "Authorization token required for private URL" },
                    { status: 401 }
                );
            }

            const token = authHeader.split(" ")[1];
            if (!token) {
                return NextResponse.json(
                    { message: "Invalid authorization format" },
                    { status: 401 }
                );
            }

            try {
                // Verify the token and get user information
                const payload = verifyAccessToken(token) as any;
                const userId = payload.user?.id;

                // Check if the authenticated user owns this URL
                if (userId !== url.userId) {
                    return NextResponse.json(
                        {
                            message:
                                "Access denied. You can only view your own private URLs",
                        },
                        { status: 403 }
                    );
                }
            } catch (error) {
                return NextResponse.json(
                    { message: "Invalid or expired token" },
                    { status: 401 }
                );
            }
        }

        let createdBy = null;
        if (url?.userId) {
            const user = await User.findById(url.userId);

            createdBy = {
                fullName: user?.firstName + " " + user?.lastName,
                userImage: user?.userImage ? user?.userImage : null,
            };
        }

        const externalUrls = await ExternalUrl.find({ urlParentId: id });
        return NextResponse.json({
            url,
            externalUrls,
            createdBy,
            isPrivate: url.public === false,
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Error fetching url", error },
            { status: 500 }
        );
    }
}

// increment views
export async function POST(request: NextRequest) {
    try {
        await connectMongo();
        const { id } = await request.json();
        const url = await Url.findById(id);
        if (!url) {
            return NextResponse.json(
                { message: "Url not found" },
                { status: 404 }
            );
        }
        url.views = url.views + 1;
        await url.save();
        return NextResponse.json({ message: "Url viewed" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Error fetching url", error },
            { status: 500 }
        );
    }
}
