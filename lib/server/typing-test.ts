import { requireAuth } from "../actions/authorization.action";
import { decryptText } from "../utils";
import { prisma } from "@/db/prisma";

//  Get user word per minute score
export async function getUserWPM(userId: string) {
    const session = await requireAuth();
    if (session?.user?.id !== userId) {
        throw new Error("Forbidden");
    }
    const userData = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            wpmSpeed: true
        }
    })
    return userData?.wpmSpeed;
}

//  Get top 10 wpm scores in class 
export async function getWPMClassHighScores(classId: string, userId: string) {
    const session = await requireAuth();
    if (session?.user?.id !== userId) {
        throw new Error("Forbidden");
    }
    const top10Typers = await prisma.classUser.findMany({
        where: { classId: classId },
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

    return decryptedStudents;
}