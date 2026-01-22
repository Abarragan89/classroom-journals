import { NextRequest, NextResponse } from "next/server";
import { getAllStudents } from "@/lib/server/classroom";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");
        const classId = searchParams.get("classId");

        if (!teacherId || !classId) {
            return NextResponse.json({ error: "Missing teacherId or classId" }, { status: 400 });
        }

        const students = await getAllStudents(classId, teacherId);

        return NextResponse.json({ students });
    } catch (error) {
        console.error("Error getting classroom IDs:", error);

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
