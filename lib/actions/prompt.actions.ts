"use server"
import { prisma } from "@/db/prisma";
import { promptSchema } from "../validators";
import { SearchOptions, Question, Prompt } from "@/types";
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
        const classesAssignTo: string[] = []

        // Extract all questions from formData & dump into questions[]
        formData.forEach((value, key) => {
            if (key.startsWith("question")) {
                questions.push({ question: (value as string).trim() }); // Convert into correct format
            }
            if (key.startsWith("classroom-assign")) {
                classesAssignTo.push(value as string)
            }
        });

        // Get title for prompt(only searchable text)
        const title = formData.get("title")?.toString().trim() || "";
        let categoryId = formData.get("prompt-category") as string | null;

        if (categoryId === "no-category" || categoryId === undefined) {
            categoryId = null;
        }

        if (!title) {
            return { success: false, message: "Title is required" };
        }


        // Get Prompt Type
        const promptType = formData.get("prompt-type") as string;

        if (promptType === 'single-question') {
            // Add blog-title and blog-image questions if a journal prompt
            questions.push({ question: 'Add a Blog Title' })
            questions.push({ question: 'Add a Cover Photo' })
        }

        // Validate using Zod
        const validationResult = promptSchema.safeParse({
            title,
            questions,
            promptType
        });
        // Check for validation error
        if (!validationResult.success) {
            console.log("Validation failed:", validationResult.error.format());
            return { success: false, message: "Missing a required field" };
        }

        await prisma.$transaction(async (prisma) => {
            // Create the Prompt
            const createdPrompt = await prisma.prompt.create({
                data: {
                    title: title.trim(),
                    teacherId,
                    promptType,
                    categoryId,
                    questions: questions as unknown as Prisma.InputJsonValue,
                },
            });

            // Create PromptSessions if there are classes to assign
            if (classesAssignTo.length > 0) {
                const promptSessions = classesAssignTo.map((classId) => ({
                    promptId: createdPrompt.id,
                    title: createdPrompt.title,
                    promptType: createdPrompt.promptType,
                    questions: createdPrompt.questions as Prisma.InputJsonValue,
                    assignedAt: new Date(),
                    classId: classId,
                    status: 'open',
                }));

                // Create all the PromptSessions in one transaction
                await prisma.promptSession.createMany({
                    data: promptSessions,
                });
            }
            return { success: true, message: 'Prompt Created!' };
        })
        return { success: true, message: 'Prompt Created!' };

    } catch (error) {
        // Improved error logging
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            // // console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }

        return { success: false, message: 'Error creating prompt. Try again.' }
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
        const classesAssignTo: string[] = []

        // Extract all questions from formData & dump into questions[]
        formData.forEach((value, key) => {
            if (key.startsWith("question")) {
                questions.push({ question: (value as string).trim() }); // Convert into correct format
            }
            if (key.startsWith("classroom-assign")) {
                classesAssignTo.push(value as string)
            }
        });

        // Get & Validate Prompt Title
        const title = formData.get("title")?.toString().trim() || "";

        let categoryId = formData.get("prompt-category") as string | null;

        if (categoryId === "no-category" || categoryId === undefined) {
            categoryId = null;
        }

        if (!title) {
            return { success: false, message: "Title is required" };
        }

        // Get & Validate Prompt ID
        const promptId = formData.get("promptId")?.toString().trim() || "";
        if (!promptId) {
            return { success: false, message: "Prompt ID is required" };
        }

        const promptType = formData.get("prompt-type") as string;

        if (promptType === 'single-question') {
            // Add blog-title and blog-image questions if a journal prompt
            questions.push({ question: 'Add a Blog Title' })
            questions.push({ question: 'Add a Cover Photo' })
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

        // Perform update
        await prisma.$transaction(async (prisma) => {
            const updatedPrompt = await prisma.prompt.update({
                where: { id: promptId },
                data: {
                    title: title.trim(),
                    teacherId,
                    categoryId,
                    questions: questions as unknown as Prisma.InputJsonValue,
                },
            });
            // Create PromptSessions if there are classes to assign
            if (classesAssignTo.length > 0) {
                const promptSessions = classesAssignTo.map((classId) => ({
                    promptId: updatedPrompt.id,
                    title: updatedPrompt.title,
                    promptType: updatedPrompt.promptType,
                    questions: updatedPrompt.questions as Prisma.InputJsonValue,
                    assignedAt: new Date(),
                    classId: classId,
                    status: 'open',
                }));

                // Create all the PromptSessions in one transaction
                await prisma.promptSession.createMany({
                    data: promptSessions,
                });
                return { success: true, message: 'Prompt Updated!' };
            }
        })
        return { success: true, message: 'Prompt Updated!' };

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

// Get all prompts of Teacher
export async function getAllTeacherPrompts(teacherId: string) {
    try {
        const allPrompts = await prisma.prompt.findMany({
            where: { teacherId },
            select: {
                id: true,
                title: true,
                promptType: true, // ✅ Now using select, not include
                createdAt: true,
                updatedAt: true,
                questions: true,
                classes: true, // Assuming you want to include this relation
                category: {
                    select: {
                        name: true,
                    }
                },
                promptSession: {
                    select: {
                        assignedAt: true,
                        class: {
                            select: {
                                id: true,
                                name: true
                            },
                        }
                    }
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

// Get a single prompt based on Id
export async function getSinglePrompt(promptId: string) {
    try {
        const prompt = await prisma.prompt.findUnique({
            where: { id: promptId },
            include: {
                classes: true,
                category: {
                    select: {
                        name: true,
                        id: true,
                    }
                },
                promptSession: {
                    select: {
                        assignedAt: true,
                        class: {
                            select: {
                                id: true,
                                name: true
                            },
                        }
                    },
                }
            },
        })
        return prompt
    } catch (error) {
        // Improved error logging
        if (error instanceof Error) {
            console.log('Error getting single prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }

        return { success: false, message: 'Error creating prompt. Try again.' }
    }
}

// Get prompts based on filtered options
export async function getFilterPrompts(filterOptions: SearchOptions) {
    console.log('filetered options ', filterOptions)
    try {
        const allPrompts = await prisma.prompt.findMany({
            where: {
                // 1️ Filter by classroom if specified
                categoryId: filterOptions.category
                    ? filterOptions.category
                    : undefined,
                // 2️ Filter by keywords in the title
                title: filterOptions.searchWords
                    ? { contains: filterOptions.searchWords, mode: "insensitive" }
                    : undefined,
                promptSession: filterOptions.filter === 'never-assigned'
                    ? { none: {} }
                    : undefined,
                promptType: filterOptions.filter === 'single-question' || filterOptions.filter === 'multi-question'
                    ? filterOptions.filter
                    : undefined
            },
            include: {
                category: true,
                promptSession: {
                    select: {
                        assignedAt: true,
                        class: {
                            select: {
                                id: true,
                                name: true
                            },
                        }
                    },
                }
            },
            take: 15,
            orderBy: {
                updatedAt: filterOptions.filter === 'asc' ? 'asc' : 'desc'
            },
            skip: filterOptions.paginationSkip, // paginaction filter
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

// Assign prompt
export async function assignPrompt(prevState: unknown, formData: FormData) {
    try {

        const promptId = formData.get('promptId') as string
        const classesAssignTo: string[] = []

        // Extract all questions from formData & dump into questions[]
        formData.forEach((value, key) => {
            if (key.startsWith("classroom")) {
                classesAssignTo.push(value as string)
            }
        });

        if (classesAssignTo.length < 1) {
            return { success: false, message: 'At least one class needs to be selected.' }
        }

        // find the prompt
        const currentPrompt = await prisma.prompt.findUnique({
            where: { id: promptId },
            select: {
                category: true,
                id: true,
                title: true,
                questions: true,
                promptType: true
            }
        })

        if (!currentPrompt) {
            return { success: false, message: 'No prompt exists with that ID' }
        }

        // Create PromptSessions if there are classes to assign
        if (classesAssignTo.length > 0) {
            const promptSessions = classesAssignTo.map((classId) => ({
                promptId: currentPrompt.id,
                title: currentPrompt.title,
                promptType: currentPrompt.promptType,
                questions: currentPrompt.questions as Prisma.InputJsonValue,
                assignedAt: new Date(),
                classId: classId,
                status: 'open',
            }));

            // Create all the PromptSessions in one transaction
            await prisma.promptSession.createMany({
                data: promptSessions,
            });
        }
        // Fetch the updated prompt including its promptSessions
        const updatedPrompt = await prisma.prompt.findUnique({
            where: { id: promptId },
            include: {
                classes: true,
                category: true,
                promptSession: {
                    select: {
                        assignedAt: true,
                        class: {
                            select: {
                                id: true,
                                name: true
                            },
                        }
                    },
                }
            },
        });
        return { success: true, message: 'Prompt Updated!', data: updatedPrompt as unknown as Prompt };
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
            console.log('Error updating prompt:', error.message);
            console.error(error.stack);
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error updating prompt. Try again.' };
    }
}
