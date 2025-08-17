"use server"
import { prisma } from "@/db/prisma";
import { PromptSessionStatus } from "@prisma/client";
import { requireAuth } from "./authorization.action";


// Delete Prompt
export async function deletePromptSession(prevState: unknown, formData: FormData) {
    try {
        const teacherId = formData.get('teacherId') as string
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden');
        }
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
        const teacherId = formData.get('teacherId') as string
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden');
        }
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
        const teacherId = formData.get('teacherId') as string
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden');
        }
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

