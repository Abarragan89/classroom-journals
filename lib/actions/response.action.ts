"use server";
import { prisma } from "@/db/prisma";

export async function createStudentResponse(prevState: unknown, formData: FormData) {
    try {
        const studentId = formData.get('studentId') as string
        const promptSessionId = formData.get('promptSessionId') as string
        const responseData = formData.get('responseData') as string

        const response = JSON.parse(responseData)
        console.log('resposne ', response)


        // console.log('studentId', studentId)
        // console.log('prompotsession', promptSessionId)
        // console.log('response ', responseData)

        await prisma.response.create({
            data: {
                promptSessionId,
                studentId,
                response

            }
        })

        return { success: true, message: "responses submitted" };

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