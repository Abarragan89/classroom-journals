import { NextRequest, NextResponse } from "next/server";
import { getSinglePrompt } from "@/lib/server/prompts";

export async function GET(
    req: NextRequest,
    { params }: { params: { promptId: string } }
) {
    try {
        const { promptId } = await params;
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");

        if (!teacherId) {
            return NextResponse.json({ error: "Missing teacherId" }, { status: 400 });
        }

        if (!promptId) {
            return NextResponse.json({ error: "Missing promptId" }, { status: 400 });
        }

        const prompt = await getSinglePrompt(promptId, teacherId);

        if (!prompt) {
            return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
        }

        return NextResponse.json({ prompt });
    } catch (error) {
        console.error("Error getting single prompt:", error);

        if (error instanceof Error) {
            if (error.message === "Forbidden") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
