import { prisma } from "@/db/prisma";
import { promptSchema } from "../validators";

// Create new prompt 
export async function createNewPrompt(prevState: unknown, formData: FormData) {
    try {
        // Verify Teacher Id
        const teacherId = formData.get('teacherId')
        if (typeof teacherId !== 'string') {
            throw new Error('Missing teacher ID');
        }
        const questions: { content: string }[] = [];

        // Extract all questions from formData & dump into questions[]
        formData.forEach((value, key) => {
            if (key.startsWith("question")) {
                questions.push({ content: value as string }); // Convert into correct format
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

        // Create prompt and add to database
        const newPrompt = await prisma.prompt.create({
            data: {
                title: title,
                teacherId

            }
        })
        console.log('new prompt ', newPrompt)

        return { success: true, message: 'Prompt Created!' }
    } catch (error) {
        console.log('error creating new prompt ', error)
        return { success: false, message: 'Error creating prompt. Try again.' }

    }
}