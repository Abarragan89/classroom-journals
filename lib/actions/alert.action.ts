"use server"
import { prisma } from "@/db/prisma";
import { requireAuth } from "./authorization.action";


// Get all Teacher Classes
export async function clearAllQuipAlerts(userId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== userId) {
            throw new Error("Forbidden");
        }

        await prisma.alert.deleteMany({
            where: {
                userId,
                type: "NEWQUIP"
            }
        })
        return { success: true, message: 'deleted all quip alerts' }
    } catch (error) {
        console.log('error creating classroom', error)
        return { success: false, message: 'Error creating class. Try again.' }
    }
}