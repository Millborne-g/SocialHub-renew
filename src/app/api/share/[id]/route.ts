import Url from "@/schema/Urls";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/middlewares/auth";
import ExternalUrl from "@/schema/ExternalUrl";
import User from "@/schema/Users";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const url = await Url.findById(id);
        if (url?.public === false) {
            return NextResponse.json(
                { message: "Url is private" },
                { status: 401 }
            );
        }

        let createdBy = null;
        if (url?.userId) {
            const user = await User.findById(url.userId);

            createdBy = {
                fullName: user?.firstName + " " + user?.lastName,
                userImage: user?.userImage ? user?.userImage : null,
            };
        }

        const externalUrls = await ExternalUrl.find({ urlParentId: id });
        return NextResponse.json({ url, externalUrls, createdBy });
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching url" },
            { status: 500 }
        );
    }
}
