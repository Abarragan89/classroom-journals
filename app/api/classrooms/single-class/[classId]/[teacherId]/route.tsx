import { NextRequest, NextResponse } from "next/server";
import { getSingleClassroom } from "@/lib/server/classroom";

export async function GET(req: NextRequest, { params }: { params: { teacherId: string, classId: string } }) {
    try {

        const { teacherId, classId } = params;

        if (!teacherId || !classId) {
            return NextResponse.json({ error: "Missing teacherId or classId" }, { status: 400 });
        }

        const classrooms = await getSingleClassroom(classId, teacherId);

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
