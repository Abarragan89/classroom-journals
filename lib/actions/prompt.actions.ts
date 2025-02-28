import { prisma } from "@/db/prisma";

// Create new prompt 
export async function createNewPrompt(prevState: unknown, formData: FormData) {
    try {
        const questions: { name: string; value: string }[] = [];

        // Loop through all formData entries
        formData.forEach((value, key) => {
            if (key.startsWith("question")) {
                questions.push({ name: key, value: value as string });
            }
        });
        const title = formData.get('title')


        console.log('title ', title)
        console.log("Questions: ", questions);

        return { success: true, message: 'Prompt Created!' }
    } catch (error) {
        console.log('error creating new prompt ', error)
        return { success: false, message: 'Error creating prompt. Try again.' }

    }
}