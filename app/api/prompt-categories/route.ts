import { NextRequest, NextResponse } from "next/server";
import { getAllPromptCategories } from "@/lib/server/student-dashboard";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const categories = await getAllPromptCategories(userId);

        return NextResponse.json({ categories });
    } catch (error) {
        console.error("Error getting prompt categories:", error);

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
