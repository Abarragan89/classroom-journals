import { NextRequest, NextResponse } from "next/server";
import { getAllTeacherPrompts } from "@/lib/server/prompts";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ teacherId: string }> }
) {
    try {
        const { teacherId } = await params;

        if (!teacherId) {
            return NextResponse.json({ error: "Missing teacherId" }, { status: 400 });
        }

        const prompts = await getAllTeacherPrompts(teacherId);

        return NextResponse.json({ prompts });
    } catch (error) {
        console.error("Error getting prompts:", error);

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
