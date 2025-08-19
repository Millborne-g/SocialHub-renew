import { NextRequest, NextResponse } from "next/server";
import Url from "@/schema/Urls";
import { requireAuth } from "@/middlewares/auth";

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const authResult = requireAuth(request as any);
        if (authResult) {
            return authResult; // Return error response if authentication fails
        }

        const urls = await Url.find({});
        return NextResponse.json(urls);
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching urls" },
            { status: 500 }
        );
    }
}
