"use server"
import { prisma } from "@/db/prisma";
import { decryptText } from "../utils";

export async function getAllSessionsInClass(classId: string) {
    try {
        const allPromptSession = await prisma.promptSession.findMany({
            where: { classId: classId },
            orderBy: { createdAt: 'desc' },
            include: {
                responses: true,

            }
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

