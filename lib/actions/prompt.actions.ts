"use server"
import { prisma } from "@/db/prisma";
import { promptSchema } from "../validators";
import { SearchOptions } from "@/types";

// Create new prompt 
export async function createNewPrompt(prevState: unknown, formData: FormData) {
    try {
        // Verify Teacher Id
        const teacherId = formData.get('teacherId')
        if (typeof teacherId !== 'string') {
            throw new Error('Missing teacher ID');
        }
        const questions: string[] = [];
        const classroomIds: string[] = []

        // Extract all questions from formData & dump into questions[]
        formData.forEach((value, key) => {
            if (key.startsWith("question")) {
                questions.push(value as string); // Convert into correct format
            }
            if (key.startsWith("classroom")) {
                classroomIds.push(value as string)
            }
        });

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
            return { success: false, message: "Complete question required" };
        }

        await prisma.prompt.create({
            data: {
                title: title.trim(),
                teacherId,
                classes: {
                    connect: classroomIds.map((classId) => ({ id: classId })), // Connect multiple classrooms
                },
                questions: {
                    create: questions.map((q) => ({
                        content: q.trim(),
                    })),
                },
            },
            include: {
                questions: true, // Include created questions in the returned result
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
            include: {
                questions: true,
                classes: {
                }
            },
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

// Get prompts from a particular class
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
            include: {
                questions: true
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

// Get prompts from a filter and possibly a class if provided
// export async function getAllTeacherPromptsFiltered(teacherId: string, filter: string, limit: number, offset: number) {
//     return prisma.prompt.findMany({
//         where: {
//             teacherId,
//             category: filter !== "all" ? filter : undefined, // Apply filter only if it's not "all"
//         },
//         take: limit,  // Fetch limited results (pagination)
//         skip: offset, // Skip for pagination
//         orderBy: { createdAt: "desc" } // Newest first
//     });
// }