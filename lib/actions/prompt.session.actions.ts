"use server"
import { prisma } from "@/db/prisma";
import { decryptText } from "../utils";
import { SearchOptions } from "@/types";

export async function getAllSessionsInClass(classId: string) {
    try {
        const allPromptSession = await prisma.promptSession.findMany({
            where: { classId: classId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                responses: true,
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
            take: 50
        })
        return allPromptSession
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

export async function getSinglePromptSession(promptId: string) {
    try {
        const allPromptSession = await prisma.promptSession.findUnique({
            where: { id: promptId },
            select: {
                id: true,
                questions: true,
                assignedAt: true,
                isPublic: true,
                responses: {
                    select: {
                        notifications: true,
                        id: true,
                        student: {
                            select: {
                                id: true,
                                username: true,
                                iv: true,
                            }
                        }
                    }
                }
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


// Delete Prompt
export async function deletePromptSession(prevState: unknown, formData: FormData) {
    try {
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
        const promptStatus = formData.get('promptStatus') as string
        const promptId = formData.get('promptId') as string

        await prisma.promptSession.update({
            where: { id: promptId },
            data: {
                status: promptStatus
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
                promptType: filterOptions.filter === 'single-question' || filterOptions.filter === 'multi-question'
                    ? filterOptions.filter
                    : undefined
            },
            select: {
                isPublic: true,
                id: true,
                updatedAt: true,
                createdAt: true,
                title: true,
                promptType: true,
                prompt: {
                    select: {
                        category: true,
                    }
                },
            },
            take: 15,
            orderBy: {
                updatedAt: filterOptions.filter === 'asc' ? 'asc' : 'desc'
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

