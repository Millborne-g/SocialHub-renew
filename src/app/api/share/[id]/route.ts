import Url from "@/schema/Urls";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/middlewares/auth";
import ExternalUrl from "@/schema/ExternalUrl";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const url = await Url.findById(id);
        if (url?.public === false) {
            return NextResponse.json(
                { message: "Url is private" },
                { status: 401 }
            );
        }
        const externalUrls = await ExternalUrl.find({ urlParentId: id });
        return NextResponse.json({ url, externalUrls });
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching url" },
            { status: 500 }
        );
    }
}
