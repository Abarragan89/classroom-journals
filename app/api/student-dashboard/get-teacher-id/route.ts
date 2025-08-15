import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/actions/authorization.action";
import { prisma } from "@/db/prisma";
import { ClassUserRole } from "@prisma/client";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const classroomId = searchParams.get("classroomId");

        if (!classroomId) {
            return NextResponse.json({ error: "Missing classroomId" }, { status: 400 });
        }

        // Auth check
        const session = await requireAuth();
        if (session?.classroomId !== classroomId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get teacher ID
        const teacher = await prisma.classUser.findFirst({
            where: {
                classId: classroomId,
                role: ClassUserRole.TEACHER,
            },
            select: {
                userId: true,
            },
        });

        if (!teacher) {
            return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
        }

        return NextResponse.json({ teacherId: teacher.userId });
    } catch (error) {
        console.error("Error fetching teacherId:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
