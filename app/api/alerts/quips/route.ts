import { NextRequest, NextResponse } from "next/server";
import { getAllQuipAlerts } from "@/lib/server/alerts";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const quipAlerts = await getAllQuipAlerts(userId);

        return NextResponse.json({ quipAlerts });
    } catch (error) {
        console.error("Error getting quip alerts:", error);

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
