import User from "@/schema/Users";
import connectMongo from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/middlewares/auth";

// check if user is signed up through google
export async function GET(request: NextRequest) {
    try {
        const authResult = requireAuth(request as any);
        if (authResult instanceof NextResponse) {
            return authResult; // Return error response if not authenticated
        }

        const user = authResult as any; // Get user from requireAuth
        await connectMongo();

        const userRecord = await User.findById(user?.user?.id);
        if (!userRecord) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Check if user signed up with Google (password field is empty)
        const isGoogleUser = !userRecord.password || userRecord.password === "";

        return NextResponse.json(
            {
                isGoogleUser,
                message: isGoogleUser
                    ? "User signed up with Google"
                    : "User signed up with email/password",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Check user type error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Check authentication
        const authResult = requireAuth(request as any);
        if (authResult instanceof NextResponse) {
            return authResult; // Return error response if not authenticated
        }

        const user = authResult as any; // Get user from requireAuth
        const body = await request.json();
        const { currentPassword, newPassword } = body;

        // Validate input
        if (!newPassword) {
            return NextResponse.json(
                { message: "New password is required" },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { message: "New password must be at least 6 characters long" },
                { status: 400 }
            );
        }

        await connectMongo();

        const userRecord = await User.findById(user?.user?.id);
        if (!userRecord) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Check if user is a Google user (no password set)
        const isGoogleUser = !userRecord.password || userRecord.password === "";

        if (isGoogleUser) {
            // For Google users, no need to verify current password
            userRecord.password = newPassword;
            await userRecord.save();

            return NextResponse.json(
                {
                    message:
                        "Password set successfully. Note: You will no longer be able to sign in with Google after setting a password.",
                    isGoogleUser: true,
                },
                { status: 200 }
            );
        } else {
            // For regular users, verify current password
            if (!currentPassword) {
                return NextResponse.json(
                    { message: "Current password is required" },
                    { status: 400 }
                );
            }

            const isCurrentPasswordCorrect =
                currentPassword === userRecord.password;
            if (!isCurrentPasswordCorrect) {
                return NextResponse.json(
                    { message: "Current password is incorrect" },
                    { status: 401 }
                );
            }

            // Update password
            userRecord.password = newPassword;
            await userRecord.save();

            return NextResponse.json(
                { message: "Password updated successfully" },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error("Password update error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
