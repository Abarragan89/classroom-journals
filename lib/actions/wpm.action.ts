"use server";
import { prisma } from "@/db/prisma";
import { decryptText } from "../utils";

// Update Word per minute score
export async function updateUserWpm(userId: string, wpm: number) {
    try {
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

//  Get user word per minute score
export async function getUserWPM(userId: string) {
    try {
        const userData = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                wpmSpeed: true
            }
        })
        return userData?.wpmSpeed

    } catch (error) {
        if (error instanceof Error) {
            console.log("Error getting word per minute:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }

        return { success: false, message: "Error getting word per minute. Try again." };
    }
}

//  Get top 10 wpm scores in class 
export async function getWPMClassHighScores(classId: string) {
    try {
        const top10Typers = await prisma.classUser.findMany({
            where: { classId: classId, role: { not: "TEACHER" } },
            orderBy: {
                user: {
                    wpmSpeed: 'desc'
                }
            },
            select: {
                user: {
                    select: {
                        id: true,
                        iv: true,
                        username: true,
                        wpmSpeed: true,
                    }
                }
            },
            take: 10
        })

        // Decode student usernames to display
        const decryptedStudents = top10Typers
            .filter(studentObj => studentObj.user)
            .map(({ user }) => ({
                username: decryptText(user.username as string, user.iv as string),
                wpmSpeed: user.wpmSpeed,
                id: user.id
            }));

        return decryptedStudents
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error getting top 10 typers:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }

        return { success: false, message: "Error getting top 10 typers. Try again." };
    }
}