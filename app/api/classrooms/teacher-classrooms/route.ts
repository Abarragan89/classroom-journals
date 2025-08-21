import { NextRequest, NextResponse } from "next/server";
import { getAllClassrooms } from "@/lib/server/classroom";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");

        if (!teacherId) {
            return NextResponse.json({ error: "Missing teacherId" }, { status: 400 });
        }

        const classrooms = await getAllClassrooms(teacherId);

        return NextResponse.json({ classrooms });
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
