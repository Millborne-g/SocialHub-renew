import User from "@/schema/Users";
import connectMongo from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";

// ----------------- signup -----------------
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName, userImage } = body;

        await connectMongo();

        const user = await User.findOne({ email });

        if (user) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );
        }

        const newUser = new User({
            email,
            password,
            firstName,
            lastName,
            userImage: userImage ?? null,
        });
        await newUser.save();

        const accessToken = generateAccessToken({
            user: {
                id: newUser._id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                userImage: newUser.userImage ?? null,
            },
        });
        const refreshToken = generateRefreshToken({ user: newUser._id });

        const response = NextResponse.json(
            { message: "User created successfully", accessToken },
            { status: 201 }
        );

        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: "/",
        });

        return response;
    } catch (error) {
        console.log(error);
    }
}

// ----------------- login -----------------
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const email = searchParams.get("email");
        const password = searchParams.get("password");

        await connectMongo();

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        const isPasswordCorrect = password === user.password;

        if (!isPasswordCorrect) {
            return NextResponse.json(
                { message: "Invalid password" },
                { status: 401 }
            );
        }

        const accessToken = generateAccessToken({
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                userImage: user.userImage,
            },
        });
        const refreshToken = generateRefreshToken({ user: user._id });

        // Create response with access token
        const response = NextResponse.json(
            {
                message: "Login successful",
                accessToken,
            },
            { status: 200 }
        );

        // Set refresh token in HTTP-only cookie
        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: "/",
        });

        return response;
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
