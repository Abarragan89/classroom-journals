import { NextRequest, NextResponse } from "next/server";
import { getAllSessionsInClass } from "@/lib/server/prompt-sessions";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const classId = searchParams.get("classId");
        const teacherId = searchParams.get("teacherId");

        if (!classId) {
            return NextResponse.json({ error: "Missing classId" }, { status: 400 });
        }

        if (!teacherId) {
            return NextResponse.json({ error: "Missing teacherId" }, { status: 400 });
        }

        const sessionData = await getAllSessionsInClass(classId, teacherId);

        return NextResponse.json({ sessionData });
    } catch (error) {
        console.error("Error getting class sessions:", error);

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
