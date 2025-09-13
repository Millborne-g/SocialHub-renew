import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const response = NextResponse.json(
            { message: "Logged out successfully" },
            { status: 200 }
        );

        response.cookies.delete("refreshToken");

        return response;
    } catch (error) {
        console.log(error);
    }
}
