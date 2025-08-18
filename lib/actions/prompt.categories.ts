"use server"
import { prisma } from "@/db/prisma";
import { requireAuth } from "./authorization.action";
// Add Prompt Category
export async function addPromptCategory(categoryName: string, userId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== userId) {
            throw new Error('Forbidden');
        }
        const newCategory = await prisma.promptCategory.create({
            data: {
                name: categoryName,
                userId
            }
        })
        return newCategory

    } catch (error) {
        if (error instanceof Error) {
            console.log('Error adding category:', error.message);
            console.error(error.stack);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}


// Delete Prompt Category
export async function deletePromptCategory(id: string, teacherId: string) {
    try {

        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden');
        }

        await prisma.promptCategory.delete({
            where: { id }
        })
        return { success: true, message: 'Error deleting categories. Try again.' };

    } catch (error) {
        if (error instanceof Error) {
            console.log('Error adding category:', error.message);
            console.error(error.stack);
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error deleting categories. Try again.' };
    }
}

// Delete Prompt Category
export async function editPromptCategory(id: string, newCategoryName: string, teacherId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden');
        }
        await prisma.promptCategory.update({
            where: { id },
            data: {
                name: newCategoryName
            }
        })
        return { success: true, message: 'Error deleting categories. Try again.' };

    } catch (error) {
        if (error instanceof Error) {
            console.log('Error adding category:', error.message);
            console.error(error.stack);
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error deleting categories. Try again.' };
    }
}

