import { NextRequest, NextResponse } from "next/server";
import { getFilterPrompts } from "@/lib/server/prompts";
import { SearchOptions } from "@/types";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");
        const category = searchParams.get("category");
        const searchWords = searchParams.get("searchWords");
        const filter = searchParams.get("filter");
        const paginationSkip = searchParams.get("paginationSkip");

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

        const prompts = await getFilterPrompts(filterOptions, teacherId);

        return NextResponse.json({ prompts });
    } catch (error) {
        console.error("Error getting filtered prompts:", error);

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
