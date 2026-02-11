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

        const isAllowedToAssign = isSubscribed || (!isSubscribed && promptSessionCount < 10);


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
            console.error("Error assigning prompt:", error.message);
            console.error(error.stack);
        } else {
            console.error("Unexpected error:", error);
        }
        return { success: false, message: error, data: null }
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
            }
        })

        const decryptedResponse = {
            ...userResponse,
            student: {
                avatarURL: userResponse.student.avatarURL,
                username: decryptText(userResponse?.student?.username as string, userResponse?.student?.iv as string)
            }
        }

        return decryptedResponse;

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error assigning prompt:", error.message);
            console.error(error.stack);
        } else {
            console.error("Unexpected error:", error);
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
            console.error("Error deleting quip:", error.message);
            console.error(error.stack);
        } else {
            console.error("Unexpected error:", error);
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
            console.error("Error deleting quip:", error.message);
            console.error(error.stack);
        } else {
            console.error("Unexpected error:", error);
        }
        return { success: false, message: "Error assigning prompt. Try again." };
    }
}