import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken, verifyRefreshToken } from "@/lib/jwt";
import connectMongo from "@/lib/mongodb";
import User from "@/schema/Users";

export async function GET(request: NextRequest) {
    try {
        const refreshToken = request.cookies.get("refreshToken")?.value;
        if (!refreshToken) {
            return NextResponse.json(
                { message: "No refresh token" },
                { status: 401 }
            );
        } else {
            const decoded = verifyRefreshToken(refreshToken) as {
                id: string;
            };

            await connectMongo();

            const user = await User.findById(decoded.id);

            if (!user) {
                return NextResponse.json(
                    { message: "User not found" },
                    { status: 404 }
                );
            }

            const newAccessToken = generateAccessToken({
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    userImage: user.userImage,
                },
            });
            return NextResponse.json({ accessToken: newAccessToken });
        }
    } catch (error) {}
}
