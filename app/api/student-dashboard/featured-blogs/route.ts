import { NextRequest, NextResponse } from "next/server";
import { getFeaturedBlogs } from "@/lib/server/student-dashboard";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const classroomId = searchParams.get("classroomId");

        if (!classroomId) {
            return NextResponse.json({ error: "Missing classroomId" }, { status: 400 });
        }

        const featuredBlogs = await getFeaturedBlogs(classroomId);

        return NextResponse.json({ featuredBlogs });
    } catch (error) {
        console.error("Error getting featured blogs:", error);

        if (error instanceof Error) {
            if (error.message === "Forbidden") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            if (error.message === "Unauthorized") {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
