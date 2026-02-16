import { NextRequest, NextResponse } from "next/server";
import { getAllSessionsInClass } from "@/lib/server/prompt-sessions";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const { classId } = await params;
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");

        if (!classId) {
            return NextResponse.json({ error: "Missing classId" }, { status: 400 });
        }

        if (!teacherId) {
            return NextResponse.json({ error: "Missing teacherId" }, { status: 400 });
        }

        const result = await getAllSessionsInClass(classId, teacherId);

        return NextResponse.json({ prompts: result.prompts, totalCount: result.totalCount });
    } catch (error) {
        console.error("Error getting prompt sessions:", error);

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
