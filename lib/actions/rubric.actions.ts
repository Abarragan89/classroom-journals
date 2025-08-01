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

// Grab all rubrics for a teacher (lightweight - only id and title)
export async function getRubricListByTeacherId(teacherId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error("Forbidden");
        }

        const rubrics = await prisma.rubricTemplate.findMany({
            where: { teacherId },
            select: {
                id: true,
                title: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
        });

        return rubrics;
    } catch (error) {
        console.error('Error fetching rubric list:', error);
        throw error; // Re-throw the error for further handling
    }
}

// Grab all rubrics for a teacher (full data - keep for backward compatibility)
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

// Save a rubric grade for a student response
export async function saveRubricGrade(
    responseId: string,
    rubricId: string,
    teacherId: string,
    categories: any[], // Array of {name, selectedScore, maxScore}
    totalScore: number,
    maxTotalScore: number
) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error("Forbidden");
        }

        const percentageScore = Math.round((totalScore / maxTotalScore) * 100);

        // Use upsert to either create or update the rubric grade
        const rubricGrade = await prisma.rubricGrade.upsert({
            where: {
                responseId_rubricId: {
                    responseId,
                    rubricId
                }
            },
            update: {
                categories,
                totalScore,
                maxTotalScore,
                percentageScore,
                updatedAt: new Date()
            },
            create: {
                responseId,
                rubricId,
                teacherId,
                categories,
                totalScore,
                maxTotalScore,
                percentageScore
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

// Get rubric grade for a specific response
export async function getRubricGrade(responseId: string, rubricId?: string) {
    try {
        const session = await requireAuth();
        if (!session) {
            throw new Error("Unauthorized");
        }

        const where: any = { responseId };
        if (rubricId) {
            where.rubricId = rubricId;
        }

        const rubricGrade = await prisma.rubricGrade.findFirst({
            where,
            include: {
                rubric: {
                    select: {
                        id: true,
                        title: true,
                        categories: true
                    }
                }
            },
            orderBy: { gradedAt: 'desc' } // Get the most recent grade if multiple exist
        });

        return rubricGrade;
    } catch (error) {
        console.error('Error fetching rubric grade:', error);
        throw error;
    }
}

// Get all rubric grades for a response (if multiple rubrics were used)
export async function getRubricGradesForResponse(responseId: string) {
    try {
        const session = await requireAuth();
        if (!session) {
            throw new Error("Unauthorized");
        }

        const rubricGrades = await prisma.rubricGrade.findMany({
            where: { responseId },
            include: {
                rubric: {
                    select: {
                        id: true,
                        title: true,
                        categories: true
                    }
                }
            },
            orderBy: { gradedAt: 'desc' }
        });

        return rubricGrades;
    } catch (error) {
        console.error('Error fetching rubric grades:', error);
        throw error;
    }
}

// Delete a rubric grade
export async function deleteRubricGrade(responseId: string, rubricId: string, teacherId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error("Forbidden");
        }

        await prisma.rubricGrade.delete({
            where: {
                responseId_rubricId: {
                    responseId,
                    rubricId
                }
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