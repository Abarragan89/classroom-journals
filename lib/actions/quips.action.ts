"use server"
import { prisma } from "@/db/prisma";
import { requireAuth } from "./authorization.action";
import { AlertType, ClassUserRole, PromptSessionStatus, PromptType } from "@prisma/client";
import { ResponseData } from "@/types";
import { InputJsonArray } from "@prisma/client/runtime/library";
import { decryptText } from "../utils";

export async function createNewQuip(
    quipText: string,
    classId: string,
    teacherId: string
) {
    try {
        // Authenticate User
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden');
        }
        // Check subscription and limits
        const promptSessionCount = await prisma.promptSession.count({
            where: {
                classId
            },
        });

        const currentTeacherClassData = await prisma.user.findUnique({
            where: { id: teacherId },
            select: {
                subscriptionExpires: true,
                _count: { select: { prompts: true } }
            }
        });

        const today = new Date();
        const { subscriptionExpires } = currentTeacherClassData || {};
        const isSubscribed = subscriptionExpires && subscriptionExpires > today;

        const isAllowedToAssign = isSubscribed || (!isSubscribed && promptSessionCount < 3);


        if (!isAllowedToAssign) {
            throw new Error('You need to delete some assignments or upgrade your account before you can assign a new quip')
        }

        // generate quip question
        const questions = [{
            question: quipText,
        }]

        // Create Prompt session
        const newQuip = await prisma.promptSession.create({
            data: {
                title: 'Quip',
                isPublic: true,
                promptType: PromptType.QUIP,
                assignedAt: new Date(),
                status: PromptSessionStatus.OPEN,
                questions,
                classId,
                authorId: teacherId
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
        })

        // 3. Fetch class users
        const classUsers = await prisma.classUser.findMany({
            where: {
                classId: classId,
                role: ClassUserRole.STUDENT,
            },
            select: {
                userId: true,
            },
        });

        const alertsData = classUsers.map((classUser) => ({
            userId: classUser.userId,
            type: AlertType.NEWQUIP,
            message: "You have a new Quip!"
        }));

        // Create Notifications about Quip
        await prisma.alert.createMany({
            data: alertsData,
            skipDuplicates: true, // optional, skips if alert with same unique fields already exists
        });

        const decryptedQuip = {
            ...newQuip,
            author: {
                username: decryptText(newQuip?.author?.username as string, newQuip?.author?.iv as string),
                avatarURL: newQuip?.author?.avatarURL
            },

        }

        return { success: true, message: 'Quip added!', data: decryptedQuip }

    } catch (error) {
        if (error instanceof Error) {
            console.log("Error assigning prompt:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }
        return { success: false, message: error, data: null }
    }
}

// get quips by classroom
export async function getAllQuips(
    classId: string,
    userId: string
) {
    try {
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

    } catch (error) {
        if (error instanceof Error) {
            console.log("Error assigning prompt:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }
        return { success: false, message: "Error assigning prompt. Try again." };
    }
}

// Response to a quip 
export async function respondToQuip(
    responseText: ResponseData[],
    studentId: string,
    promptSessionId: string
) {
    try {
        // Authenticate User
        const session = await requireAuth();
        if (session?.user?.id !== studentId) {
            throw new Error('Forbidden');
        }

        const allResponses = await prisma.response.findMany({
            where: {
                promptSessionId
            },
            select: {
                studentId: true,
            }
        })

        const hasAlreadyAnswered = allResponses.some(res => res.studentId === studentId)
        if (hasAlreadyAnswered) {
            throw new Error('Only one submission is allowed')
        }

        const userResponse = await prisma.response.create({
            data: {
                response: responseText as unknown as InputJsonArray,
                studentId,
                promptSessionId,
            }
        })

        return userResponse;

    } catch (error) {
        if (error instanceof Error) {
            console.log("Error assigning prompt:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }
        return { success: false, message: "Error assigning prompt. Try again." };
    }
}

// Response to a quip 
export async function deleteQuip(
    teacherId: string,
    promptSessionId: string
) {
    try {
        // Authenticate User
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden');
        }

        const deletedQuip = await prisma.promptSession.delete({
            where: {
                id: promptSessionId
            },
            select: {
                id: true
            }
        })
        return deletedQuip

    } catch (error) {
        if (error instanceof Error) {
            console.log("Error deleting quip:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }
        return { success: false, message: "Error assigning prompt. Try again." };
    }
}

// Get all Responses for a single quip
export async function getReponsesForQuip(
    userId: string,
    promptSessionId: string
) {
    try {
        // Authenticate User
        const session = await requireAuth();
        if (session?.user?.id !== userId) {
            throw new Error('Forbidden');
        }

        const responses = await prisma.response.findMany({
            where: {
                promptSessionId
            },
            select: {
                response: true,
                id: true,
                createdAt: true,
                studentId: true,
                likeCount: true,
                likes: {
                    select: {
                        userId: true
                    }
                },
                student: {
                    select: {
                        username: true,
                        iv: true,
                        avatarURL: true,
                    }
                }
            },
            orderBy: {
                likeCount: 'desc'
            }
        })

        const decryptedResponses = responses.map(prev => ({
            ...prev,
            student: {
                avatarURL: prev.student.avatarURL,
                username: decryptText(prev?.student?.username as string, prev?.student?.iv as string)
            }
        }))
        return decryptedResponses;

    } catch (error) {
        if (error instanceof Error) {
            console.log("Error deleting quip:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }
        return { success: false, message: "Error assigning prompt. Try again." };
    }
}