import { NextRequest, NextResponse } from "next/server";
import { getAllQuips } from "@/lib/server/quips";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const classId = searchParams.get("classId");
        const userId = searchParams.get("userId");

        if (!classId) {
            return NextResponse.json({ error: "Missing classId" }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const quips = await getAllQuips(classId, userId);

        return NextResponse.json({ quips });
    } catch (error) {
        console.error("Error getting quips:", error);

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
