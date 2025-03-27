"use server"
import { prisma } from "@/db/prisma";

// Add Prompt Category
export async function addPromptCategory(categoryName: string, userId: string) {
    try {

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
            where: { userId }
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

