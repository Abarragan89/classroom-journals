import { requireAuth } from "../actions/authorization.action";
import { prisma } from "@/db/prisma";

// Get all Teacher Classes
export async function getAllQuipAlerts(userId: string) {
    const session = await requireAuth();
    if (session?.user?.id !== userId) {
        throw new Error("Forbidden");
    }

    const allQuipAlerts = await prisma.alert.count({
        where: {
            userId,
            type: "NEWQUIP"
        }
    });

    return allQuipAlerts;
}
