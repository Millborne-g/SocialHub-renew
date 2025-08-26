import { verifyAccessToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

interface AuthenticatedRequest extends NextRequest {
    user: any;
}

export function requireAuth(req: AuthenticatedRequest): NextResponse | null {
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
        return NextResponse.json(
            { message: "No token provided" },
            { status: 401 }
        );

    const token = authHeader.split(" ")[1];

    try {
        const payload = verifyAccessToken(token); // contains { userId, email, name }
        req.user = payload; // Attach to request for DB usage
        return req.user; // Continue with the request
    } catch (err) {
        return NextResponse.json(
            { message: "Token expired or invalid" },
            { status: 401 }
        );
    }
}
