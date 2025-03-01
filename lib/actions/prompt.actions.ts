import { prisma } from "@/db/prisma";
import { promptSchema } from "../validators";

// Create new prompt 
export async function createNewPrompt(prevState: unknown, formData: FormData) {
    try {
        const questions: { content: string }[] = [];

        // Extract all questions from formData
        formData.forEach((value, key) => {
            if (key.startsWith("question")) {
                questions.push({ content: value as string }); // Convert into correct format
            }
        });
        const title = formData.get("title");

        // Validate using Zod
        const validationResult = promptSchema.safeParse({
            title,
            questions,
        });
        // Check for validation error
        if (!validationResult.success) {
            console.log("Validation failed:", validationResult.error.format());
            return { success: false, message: "Title and one question required"};
        }

        // Create prompt and add to database
        

        return { success: true, message: 'Prompt Created!' }
    } catch (error) {
        console.log('error creating new prompt ', error)
        return { success: false, message: 'Error creating prompt. Try again.' }

    }
}