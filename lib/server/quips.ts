import { PromptType } from "@prisma/client";
import { requireAuth } from "../actions/authorization.action";
import { decryptText } from "../utils";
import { prisma } from "@/db/prisma";

// get quips by classroom
export async function getAllQuips(
    classId: string,
    userId: string
) {
    // Authenticate User
    const session = await requireAuth();
    if (session?.user?.id !== userId) {
        throw new Error('Forbidden');
    }

    const allQuips = await prisma.promptSession.findMany({
        where: {
            promptType: PromptType.QUIP,
            classId,
        },
        select: {
            id: true,
            questions: true,
            assignedAt: true,
            author: {
                select: {
                    username: true,
                    iv: true,
                    avatarURL: true,
                }
            },
            responses: {
                select: {
                    studentId: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const decryptedQuips = allQuips.map(quip => ({
        ...quip,
        author: {
            username: decryptText(quip?.author?.username as string, quip?.author?.iv as string),
            avatarURL: quip?.author?.avatarURL
        },
    }))

    return decryptedQuips;
}