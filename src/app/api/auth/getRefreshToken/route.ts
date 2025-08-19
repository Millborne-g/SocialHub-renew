import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const refreshToken = request.cookies.get("refreshToken")?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { message: "No refresh token found" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            refreshToken,
            message: "Token retrieved successfully",
        });
    } catch (error) {
        console.error("Error getting refresh token:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
