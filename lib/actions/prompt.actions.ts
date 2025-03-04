"use server"
import { prisma } from "@/db/prisma";
import { promptSchema } from "../validators";
import { SearchOptions, Question } from "@/types";
import { Prisma } from '@prisma/client';


// Create new prompt 
export async function createNewPrompt(prevState: unknown, formData: FormData) {
    try {
        // Verify Teacher Id
        const teacherId = formData.get('teacherId')
        if (typeof teacherId !== 'string') {
            throw new Error('Missing teacher ID');
        }
        const questions: Question[] = [];
        const classroomIds: string[] = []

        // Extract all questions from formData & dump into questions[]
        formData.forEach((value, key) => {
            if (key.startsWith("question")) {
                questions.push({ question: value as string }); // Convert into correct format
            }
            if (key.startsWith("classroom")) {
                classroomIds.push(value as string)
            }
        });

        console.log('questions , ', questions)

        // Get title for prompt(only searchable text)
        const title = formData.get("title")?.toString().trim() || "";
        if (!title) {
            return { success: false, message: "Title is required" };
        }

        // Validate using Zod
        const validationResult = promptSchema.safeParse({
            title,
            questions,
        });
        // Check for validation error
        if (!validationResult.success) {
            console.log("Validation failed:", validationResult.error.format());
            return { success: false, message: "Missing a required field" };
        }

        await prisma.prompt.create({
            data: {
                title: title.trim(),
                teacherId,
                classes: {
                    connect: classroomIds.map((classId) => ({ id: classId })), // Connect multiple classrooms
                },
                questions: questions as unknown as Prisma.InputJsonValue,
            },
        });

        return { success: true, message: 'Prompt Created!' }

    } catch (error) {
        // Improved error logging
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }

        return { success: false, message: 'Error creating prompt. Try again.' }
    }
}

// Get all prompts of Teacher
export async function getAllTeacherPrompts(teacherId: string) {
    try {
        const allPrompts = await prisma.prompt.findMany({
            where: { teacherId },
            orderBy: {
                updatedAt: 'desc'
            },
            take: 15
        })
        return allPrompts

    } catch (error) {
        // Improved error logging
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }

        return { success: false, message: 'Error creating prompt. Try again.' }
    }
}

// Get prompts based on filtered options
export async function getFilterPrompts(filterOptions: SearchOptions) {
    try {
        const allPrompts = await prisma.prompt.findMany({
            where: {
                // 1️ Filter by classroom if specified
                classes: filterOptions.classroom
                    ? { some: { id: filterOptions.classroom } }
                    : undefined,

                // 2️ Filter by keywords in the title
                title: filterOptions.searchWords
                    ? { contains: filterOptions.searchWords, mode: "insensitive" }
                    : undefined,

                // 3️ Filter by active status (if filter option is set to 'active')
                isActive: filterOptions.filter === "active" ? true : undefined,

                // 4️ filter by never assigned (if filter option is 'neverAssigned')
                lastAssigned: filterOptions.filter === "neverAssigned" ? null : undefined,
            },
            orderBy: {
                updatedAt: filterOptions.filter === 'asc' ? 'asc' : 'desc'
            },
            skip: filterOptions.paginationSkip, // 5️⃣ Handle pagination
            take: 15 // Only fetch 15 at a time
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

// Update a prompt
export async function updateAPrompt(prevState: unknown, formData: FormData) {
    try {
        // Verify Teacher Id
        const teacherId = formData.get('teacherId');
        if (typeof teacherId !== 'string') {
            throw new Error('Missing teacher ID');
        }

        const questions: Question[] = [];
        const classroomIds: string[] = [];

        // Extract questions & classrooms from formData
        formData.forEach((value, key) => {
            if (key.startsWith("question")) {
                questions.push({ question: value as string });
            }
            if (key.startsWith("classroom")) {
                classroomIds.push(value as string);
            }
        });

        // Get & Validate Prompt Title
        const title = formData.get("title")?.toString().trim() || "";
        if (!title) {
            return { success: false, message: "Title is required" };
        }

        // Get & Validate Prompt ID
        const promptId = formData.get("promptId")?.toString().trim() || "";
        if (!promptId) {
            return { success: false, message: "Prompt ID is required" };
        }

        // Validate using Zod
        const validationResult = promptSchema.safeParse({ title, questions });
        if (!validationResult.success) {
            console.log("Validation failed:", validationResult.error.format());
            return { success: false, message: "Complete question required" };
        }

        // Fetch existing prompt data
        const existingPrompt = await prisma.prompt.findUnique({
            where: { id: promptId },
            include: { classes: true }
        });

        if (!existingPrompt) {
            return { success: false, message: "Prompt not found" };
        }

        // Find classrooms to disconnect
        const currentClassIds = existingPrompt.classes.map(c => c.id);
        const classesToDisconnect = currentClassIds.filter(id => !classroomIds.includes(id));

        // Perform update
        const updatedPrompt = await prisma.prompt.update({
            where: { id: promptId },
            data: {
                title: title.trim(),
                teacherId,
                classes: {
                    connect: classroomIds.map(id => ({ id })), // Connect new classrooms
                    disconnect: classesToDisconnect.map(id => ({ id })), // Disconnect removed classrooms
                },
                questions: questions as unknown as Prisma.InputJsonValue,
            },
            
        });
        return { success: true, message: 'Prompt Updated!', data: updatedPrompt };

    } catch (error) {
        if (error instanceof Error) {
            console.error('Error updating prompt:', error.message);
            console.error(error.stack);
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error updating prompt. Try again.' };
    }
}

// Delete Prompt
export async function deletePrompt(prevState: unknown, formData: FormData) {
    try {
        const promptId = formData.get('promptId') as string

        await prisma.prompt.delete({
            where: { id: promptId }
        })
        return { success: true, message: 'Prompt Updated!', promptId };

    } catch (error) {
        if (error instanceof Error) {
            console.error('Error updating prompt:', error.message);
            console.error(error.stack);
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error updating prompt. Try again.' };
    }
}
