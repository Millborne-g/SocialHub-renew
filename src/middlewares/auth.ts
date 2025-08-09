import { verifyAccessToken } from "@/lib/jwt";
import { NextApiRequest, NextApiResponse } from "next";

interface AuthenticatedRequest extends NextApiRequest {
    user: any;
}

export function requireAuth(
    req: AuthenticatedRequest,
    res: NextApiResponse,
    next: () => void
) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];

    try {
        const payload = verifyAccessToken(token); // contains { userId, email, name }
        req.user = payload; // Attach to request for DB usage
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token expired or invalid" });
    }
}
