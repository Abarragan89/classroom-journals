"use server"

import { prisma } from "@/db/prisma";

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
            // console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }

        return { success: false, message: 'Error creating prompt. Try again.' }
    }
}