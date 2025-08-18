import { NextRequest, NextResponse } from "next/server";
import { getUnreadUserNotifications } from "@/lib/server/notifications";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const classId = searchParams.get("classId");

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        if (!classId) {
            return NextResponse.json({ error: "Missing classId" }, { status: 400 });
        }

        const unreadCount = await getUnreadUserNotifications(userId, classId);

        return NextResponse.json({ unreadCount });
    } catch (error) {
        console.error("Error getting unread notifications:", error);

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