import { NextRequest, NextResponse } from "next/server";
import { determineSubscriptionAllowance } from "@/lib/server/profile";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");

        if (!teacherId) {
            return NextResponse.json({ error: "Missing teacherId" }, { status: 400 });
        }

        const subscriptionData = await determineSubscriptionAllowance(teacherId);

        return NextResponse.json({ subscriptionData });
    } catch (error) {
        console.error("Error determining subscription allowance:", error);

        if (error instanceof Error) {
            if (error.message === "Forbidden") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            if (error.message === "Teacher not found") {
                return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
            }
            if (error.message === "Unauthorized") {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
