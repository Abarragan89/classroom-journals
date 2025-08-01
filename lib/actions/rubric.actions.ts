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
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }
        return { success: false, message: 'Error adding student. Try again.' }
    }
}

// get a single rubric by id
export async function getRubricById(rubricId: string) {
    try {
        const session = await requireAuth();
        if (!session) {
            throw new Error("Unauthorized");
        }
        
        const rubric = await prisma.rubricTemplate.findUnique({
            where: { id: rubricId },
        });

        if (!rubric) {
            throw new Error("Rubric not found");
        }

        return rubric;
    } catch (error) {
        console.error('Error fetching rubric:', error);
        throw error; // Re-throw the error for further handling
    }
}

// Grab all rubrics for a teacher
export async function getRubricsByTeacherId(teacherId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error("Forbidden");
        }

        const rubrics = await prisma.rubricTemplate.findMany({
            where: { teacherId },
            orderBy: { createdAt: 'desc' },
        });

        return rubrics;
    } catch (error) {
        console.error('Error fetching rubrics:', error);
        throw error; // Re-throw the error for further handling
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