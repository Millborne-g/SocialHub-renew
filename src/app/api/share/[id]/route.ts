import Url from "@/schema/Urls";
import { NextRequest, NextResponse } from "next/server";
import ExternalUrl from "@/schema/ExternalUrl";
import User from "@/schema/Users";
import connectMongo from "@/lib/mongodb";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectMongo();

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
        console.log(error);
        return NextResponse.json(
            { message: "Error fetching url", error },
            { status: 500 }
        );
    }
}

// increment views
export async function POST(request: NextRequest) {
    try {
        await connectMongo();
        const { id } = await request.json();
        const url = await Url.findById(id);
        if (!url) {
            return NextResponse.json(
                { message: "Url not found" },
                { status: 404 }
            );
        }
        url.views = url.views + 1;
        await url.save();
        return NextResponse.json({ message: "Url viewed" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Error fetching url", error },
            { status: 500 }
        );
    }
}
