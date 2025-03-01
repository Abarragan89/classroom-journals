"use server"
import { prisma } from "@/db/prisma";
import { promptSchema } from "../validators";

// Create new prompt 
export async function createNewPrompt(prevState: unknown, formData: FormData) {
    try {
        console.log([...formData])
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
        console.log('classroom ids', classroomIds)
        console.log('questions', questions)
        console.log('teacher id', teacherId)
        console.log('title ', title)

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

        console.log('right before the prima')

        // Start transaction to ensure atomicity
        // const newPrompt = await prisma.$transaction(async (prisma) => {
        //     // Create prompt
        //     const prompt = await prisma.prompt.create({
        //         data: {
        //             title: title.trim(),
        //             teacherId,
        //             classes: {
        //                 connect: classroomIds.map((id) => ({ id })), // Connect multiple classrooms
        //             },
        //         },
        //     })

        //     // Create questions in bulk
        //     if (questions.length > 0) {
        //         await prisma.question.createMany({
        //             data: questions.map((q) => ({
        //                 content: q.trim(),
        //                 promptId: prompt.id, // Associate each question with the newly created prompt
        //             })),
        //         });
        //     }

        //     return prompt;
        // });

        const newPrompt = await prisma.prompt.create({
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

        console.log('new prompt ', newPrompt)

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