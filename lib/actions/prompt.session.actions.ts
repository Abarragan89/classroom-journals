"use server"
import { prisma } from "@/db/prisma";
import { decryptText } from "../utils";
import { SearchOptions } from "@/types";
import { PromptSessionStatus, ResponseStatus } from "@prisma/client";
import { requireAuth } from "./authorization.action";

export async function getAllSessionsInClass(classId: string) {
    try {
        await requireAuth();
        const [totalCount, paginatedPrompts] = await Promise.all([
            prisma.promptSession.count({ where: { classId } }),
            prisma.promptSession.findMany({
                where: { classId: classId },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    responses: {
                        select: {
                            id: true,
                            studentId: true,
                            completionStatus: true,
                        }
                    },
                    isPublic: true,
                    createdAt: true,
                    promptType: true,
                    title: true,
                    status: true,
                    questions: true,
                    prompt: {
                        select: {
                            category: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                },
                take: 30
            })

        ])
        return { totalCount, prompts: paginatedPrompts };

    } catch (error) {
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }

        return { success: false, message: 'Error creating prompt. Try again.' }
    }
}
// This gets all the sessions and student's score for scoresheet report
export async function getAllSessionForScoresheet(classId: string) {
    try {
        await requireAuth();

        const classroomScores = await prisma.classroom.findUnique({
            where: { id: classId }, // Use the provided classId
            include: {
                users: {
                    where: { role: 'STUDENT' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                iv: true,
                                responses: {
                                    where: {
                                        promptSession: {
                                            classId: classId,
                                        },
                                    },
                                    include: {
                                        promptSession: {
                                            select: {
                                                id: true,
                                                title: true,
                                                assignedAt: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });


        return classroomScores

    } catch (error) {
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }

        return { success: false, message: 'Error creating prompt. Try again.' }
    }
}

export async function getAllSessionsInClassForStudent(classId: string) {
    try {
        await requireAuth();
        const [totalCount, paginatedPrompts] = await Promise.all([
            prisma.promptSession.count({ where: { classId } }),
            prisma.promptSession.findMany({
                where: { classId: classId },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    responses: {
                        select: {
                            id: true,
                            studentId: true,
                        }
                    },
                    createdAt: true,
                    promptType: true,
                    title: true,
                    status: true,
                }
            })

        ])
        return { totalCount, prompts: paginatedPrompts };

    } catch (error) {
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }

        return { success: false, message: 'Error creating prompt. Try again.' }
    }
}

export async function getSinglePromptSessionStudentDiscussion(promptId: string) {
    try {
        await requireAuth();
        const allPromptSession = await prisma.promptSession.findUnique({
            where: { id: promptId },
            select: {
                id: true,
                questions: true,
                assignedAt: true,
                isPublic: true,
                responses: {
                    where: { completionStatus: ResponseStatus.COMPLETE },
                    select: {
                        notifications: true,
                        likeCount: true,
                        _count: {
                            select: {
                                comments: true
                            }
                        },
                        id: true,
                        student: {
                            select: {
                                id: true,
                                username: true,
                                iv: true,
                            }
                        }
                    }
                },
            }
        })

        // Check if we got a prompt session
        if (!allPromptSession) {
            return null; // or handle the error as needed
        }

        // Decrypt the usernames in the responses
        const promptSessionWithDecryptedUsernames = {
            ...allPromptSession, // Spread the original data
            responses: allPromptSession.responses.map((response) => ({
                ...response,
                student: {
                    ...response.student,
                    username: decryptText(response.student.username as string, response.student.iv as string), // Decrypt the username
                }
            }))
        }

        return promptSessionWithDecryptedUsernames;
    } catch (error) {
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }

        return { success: false, message: 'Error creating prompt. Try again.' }
    }
}

// Get single prompt session with responses and student data for SinglePromptSession Page
export async function getSinglePromptSessionTeacherDashboard(sessionId: string) {
    try {
        await requireAuth();
        const promptSession = await prisma.promptSession.findUnique({
            where: { id: sessionId },
            select: {
                status: true,
                id: true,
                promptType: true,
                questions: true,
                isPublic: true,
                areGradesVisible: true,
                responses: {
                    select: {
                        id: true,
                        submittedAt: true,
                        response: true,
                        likeCount: true,
                        completionStatus: true,
                        student: {
                            select: {
                                id: true,
                                name: true,
                                iv: true,
                                username: true,
                            }
                        },
                        _count: {
                            select: {
                                comments: true
                            }
                        }
                    },
                },
                prompt: {
                    select: {
                        title: true,
                        category: {
                            select: {
                                name: true
                            }
                        }
                    },
                },
            },
        })

        // Ensure that responses exist before mapping
        const decryptedResponses = promptSession?.responses?.map((response) => ({
            ...response,
            student: {
                id: response.student.id,
                username: decryptText(response.student.username as string, response.student.iv as string),
                name: decryptText(response.student.name as string, response.student.iv as string)
            }
        }));

        // Keep the rest of the promptSession unchanged
        const updatedPromptSession = {
            ...promptSession,
            responses: decryptedResponses,
        };
        return updatedPromptSession;
    } catch (error) {
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }

        return { success: false, message: 'Error creating prompt. Try again.' }
    }
}


// Delete Prompt
export async function deletePromptSession(prevState: unknown, formData: FormData) {
    try {
        await requireAuth();
        const promptId = formData.get('promptId') as string

        await prisma.promptSession.delete({
            where: { id: promptId }
        })
        return { success: true, message: 'Prompt Updated!', promptId };

    } catch (error) {
        if (error instanceof Error) {
            console.log('Error deleting prompt:', error.message);
            console.error(error.stack);
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error deleting prompt. Try again.' };
    }
}

// Toggle Blog Status
export async function toggleBlogStatus(prevState: unknown, formData: FormData) {
    try {
        await requireAuth();
        const promptStatus = formData.get('promptStatus') as string
        const promptId = formData.get('promptId') as string

        await prisma.promptSession.update({
            where: { id: promptId },
            data: {
                status: promptStatus === 'OPEN' ? PromptSessionStatus.OPEN : PromptSessionStatus.CLOSED
            }
        })
        return { success: true, message: 'Prompt Updated!', promptId };

    } catch (error) {
        if (error instanceof Error) {
            console.log('Error updating prompt:', error.message);
            console.error(error.stack);
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error updating prompt. Try again.' };
    }
}

// Toggle Blog Status
export async function togglePublicPrivateStatus(prevState: unknown, formData: FormData) {
    try {
        await requireAuth();
        const promptStatus = formData.get('promptStatus') as string
        const promptId = formData.get('promptId') as string

        await prisma.promptSession.update({
            where: { id: promptId },
            data: {
                isPublic: promptStatus === 'private' ? false : true
            }
        })
        return { success: true, message: 'Prompt Updated!', promptId };

    } catch (error) {
        if (error instanceof Error) {
            console.log('Error updating prompt:', error.message);
            console.error(error.stack);
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error updating prompt. Try again.' };
    }
}

// Filter through promptsessions on classroom homepage
// Get prompts based on filtered options
export async function getFilteredPromptSessions(filterOptions: SearchOptions) {
    try {
        await requireAuth();
        const allPrompts = await prisma.promptSession.findMany({
            where: {
                // 1️ Filter by classroom if specified
                prompt: {
                    categoryId: filterOptions.category
                        ? filterOptions.category
                        : undefined,
                },
                // 2️ Filter by keywords in the title
                title: filterOptions.searchWords
                    ? { contains: filterOptions.searchWords, mode: "insensitive" }
                    : undefined,
                promptType: filterOptions.filter === 'BLOG' || filterOptions.filter === 'ASSESSMENT'
                    ? filterOptions.filter
                    : undefined
            },
            select: {
                id: true,
                isPublic: true,
                createdAt: true,
                promptType: true,
                title: true,
                status: true,
                questions: true,
                prompt: {
                    select: {
                        category: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                responses: {
                    select: {
                        id: true,
                        studentId: true,
                        submittedAt: true
                    }
                }
            },
            take: 30,
            orderBy: {
                createdAt: filterOptions.filter === 'asc' ? 'asc' : 'desc'
            },
            skip: filterOptions.paginationSkip, // pagination filter
        });

        return allPrompts;
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }

        return { success: false, message: "Error fetching prompts. Try again." };
    }
}

