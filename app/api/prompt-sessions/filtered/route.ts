import { NextRequest, NextResponse } from "next/server";
import { getFilteredPromptSessions } from "@/lib/server/prompt-sessions";
import { SearchOptions } from "@/types";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const classId = searchParams.get("classId");
        const teacherId = searchParams.get("teacherId");
        const category = searchParams.get("category");
        const searchWords = searchParams.get("searchWords");
        const filter = searchParams.get("filter");
        const paginationSkip = searchParams.get("paginationSkip");

        if (!classId) {
            return NextResponse.json({ error: "Missing classId" }, { status: 400 });
        }

        if (!teacherId) {
            return NextResponse.json({ error: "Missing teacherId" }, { status: 400 });
        }

        // Build filter options object
        const filterOptions: SearchOptions = {
            category: category || "",
            searchWords: searchWords || "",
            filter: filter || "",
            paginationSkip: paginationSkip ? parseInt(paginationSkip, 10) : 0,
        };

        const promptSessions = await getFilteredPromptSessions(filterOptions, classId, teacherId);

        return NextResponse.json({ promptSessions });
    } catch (error) {
        console.error("Error getting filtered prompt sessions:", error);

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
