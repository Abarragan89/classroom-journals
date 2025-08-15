import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { auth } from "@/auth"; // same auth you used in requireAuth()
import { decryptText } from "@/lib/utils";

export async function GET(req: Request) {
    try {
        // Parse query param
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        if (!studentId) {
            return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
        }

        // Authenticate user
        const session = await auth();
        if (!session || session.user?.id !== studentId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get student username + IV
        const studentInfo = await prisma.user.findUnique({
            where: { id: studentId },
            select: {
                username: true,
                iv: true,
            },
        });

        if (!studentInfo) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Decrypt username
        const username = decryptText(studentInfo.username as string, studentInfo.iv as string);

        return NextResponse.json({ username });
    } catch (error) {
        console.error("Error getting student username:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
