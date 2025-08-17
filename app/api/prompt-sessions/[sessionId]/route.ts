import { NextRequest, NextResponse } from "next/server";
import { getSinglePromptSessionTeacherDashboard } from "@/lib/server/prompt-sessions";

export async function GET(
    req: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");
        const { sessionId } = params;

        if (!teacherId) {
            return NextResponse.json({ error: "Missing teacherId" }, { status: 400 });
        }

        if (!sessionId) {
            return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
        }

        const promptSession = await getSinglePromptSessionTeacherDashboard(sessionId, teacherId);

        if (!promptSession) {
            return NextResponse.json({ error: "Prompt session not found" }, { status: 404 });
        }

        return NextResponse.json({ promptSession });
    } catch (error) {
        console.error("Error getting prompt session:", error);

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
