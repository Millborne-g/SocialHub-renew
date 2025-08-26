import Url from "@/schema/Urls";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/middlewares/auth";
import ExternalUrl from "@/schema/ExternalUrl";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check authentication
        const authResult: any = requireAuth(request as any);
        if (authResult?.status === 401) {
            return authResult; // Return error response if authentication fails
        }
        const userId = (authResult as any).user.id;
        const { id } = params;
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
