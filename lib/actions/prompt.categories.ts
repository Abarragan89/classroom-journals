"use server"
import { prisma } from "@/db/prisma";
import { auth } from "@/auth";
// Add Prompt Category
export async function addPromptCategory(categoryName: string, userId: string) {
    try {
        const session = await auth()
        if (!session) {
            throw new Error("Unauthorized")
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

// Get All Prompt Categories
export async function getAllPromptCategories(userId: string) {
    try {

        const allCategories = await prisma.promptCategory.findMany({
            where: { userId },
            select: { id: true, name: true }
        })

        return allCategories;
    } catch (error) {
        if (error instanceof Error) {
            console.log('Error getting categories:', error.message);
            console.error(error.stack);
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error getting categories. Try again.' };
    }
}


//


// Delete Prompt Category
export async function deletePromptCategory(id: string) {
    try {

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
export async function editPromptCategory(id: string, newCategoryName: string) {
    try {
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

