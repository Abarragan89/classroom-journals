"use server";
import { prisma } from "@/db/prisma";
import { decryptText } from "../utils";
import { requireAuth } from "./authorization.action";

// Update Word per minute score
export async function updateUserWpm(userId: string, wpm: number) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== userId) {
            throw new Error("Forbidden");
        }
        await prisma.user.update({
            where: { id: userId },
            data: {
                wpmSpeed: wpm
            }
        })
        return { success: true, message: "Updating user score successful" };
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error updating word per minute:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }

        return { success: false, message: "Error updating word per minute. Try again." };
    }
}