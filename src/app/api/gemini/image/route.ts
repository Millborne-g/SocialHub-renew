import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
    try {
        // const ai = new GoogleGenAI({
        //     apiKey: GEMINI_API_KEY,
        // });
        // const authResult = requireAuth(request as any);
        // if (authResult?.status === 401) {
        //     return authResult; // Return error response if authentication fails
        // }

        // const { prompt } = await request.json();

        // const response = await ai.models.generateContent({
        //     model: "gemini-2.5-flash-image-preview",
        //     contents: prompt,
        // });

        // return NextResponse.json(response.text);
    } catch (error) {
        console.error("Error generating text:", error);
        return NextResponse.json(
            { message: "Error generating text" },
            { status: 500 }
        );
    }
}
