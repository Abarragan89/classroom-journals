"use server";
import { prisma } from "@/db/prisma";
import { requireAuth } from "./authorization.action";
import { InputJsonValue } from "@prisma/client/runtime/library";

// This is for the teacher to get notifications if there are requests, work as notifications
export async function createRubric(teacherId: string, rubricData: InputJsonValue, title: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error("Forbidden");
        }

        const newRubric = await prisma.rubricTemplate.create({
            data: {
                teacherId: teacherId,
                categories: rubricData,
                title
            },
        })

        return { success: true, message: 'Rubric created successfully', rubric: newRubric };
    } catch (error) {
        // Improved error logging
        if (error instanceof Error) {
            console.error('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error adding student. Try again.' }
    }
}

// Update a rubric by id
export async function updateRubric(rubricId: string, rubricData: InputJsonValue, title: string) {
    try {
        const session = await requireAuth();
        if (!session) {
            throw new Error("Unauthorized");
        }

        const updatedRubric = await prisma.rubricTemplate.update({
            where: { id: rubricId },
            data: {
                categories: rubricData,
                title
            },
        });

        return { success: true, message: 'Rubric updated successfully', rubric: updatedRubric };
    } catch (error) {
        console.error('Error updating rubric:', error);
        throw error; // Re-throw the error for further handling
    }
}

// Delete a rubric by id
export async function deleteRubric(rubricId: string) {
    try {
        const session = await requireAuth();
        if (!session) {
            throw new Error("Unauthorized");
        }

        await prisma.rubricTemplate.delete({
            where: { id: rubricId },
        });

        return { success: true, message: 'Rubric deleted successfully' };
    } catch (error) {
        console.error('Error deleting rubric:', error);
        throw error; // Re-throw the error for further handling
    }
}

// Save a rubric grade for a student response
type RubricCategoryGrade = {
    name: string;
    selectedScore: number;
    maxScore: number;
};

export async function saveRubricGrade(
    responseId: string,
    rubricId: string,
    teacherId: string,
    categories: RubricCategoryGrade[],
    totalScore: number,
    maxTotalScore: number,
    comment?: string
) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error("Forbidden");
        }

        const percentageScore = Math.round((totalScore / maxTotalScore) * 100);

        const rubricGrade = await prisma.rubricGrade.upsert({
            where: { responseId },
            update: {
                rubricId,
                categories,
                totalScore,
                maxTotalScore,
                percentageScore,
                comment,
                updatedAt: new Date()
            },
            create: {
                responseId,
                rubricId,
                teacherId,
                categories,
                totalScore,
                maxTotalScore,
                percentageScore,
                comment
            }
        });

        return { success: true, message: 'Rubric grade saved successfully', grade: rubricGrade };
    } catch (error) {
        console.error('Error saving rubric grade:', error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'Error saving rubric grade. Try again.' };
    }
}

// Delete a rubric grade
export async function deleteRubricGrade(responseId: string, teacherId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error("Forbidden");
        }

        await prisma.rubricGrade.delete({
            where: {
                responseId
            }
        });

        return { success: true, message: 'Rubric grade deleted successfully' };
    } catch (error) {
        console.error('Error deleting rubric grade:', error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'Error deleting rubric grade. Try again.' };
    }
}