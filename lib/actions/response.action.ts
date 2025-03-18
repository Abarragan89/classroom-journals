"use server";
import { prisma } from "@/db/prisma";

export async function createStudentResponse(prevState: unknown, formData: FormData) {
    try {
        const studentId = formData.get('studentId') as string
        const promptSessionId = formData.get('promptSessionId') as string
        const responseData = formData.get('responseData') as string
        const response = JSON.parse(responseData)

        await prisma.response.create({
            data: {
                promptSessionId,
                studentId,
                response,
                submittedAt: new Date()
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

export async function gradeStudentResponse(responseId: string, question: number, score: number) {
    try {
        // Fetch the current response
        const existingResponse = await prisma.response.findUnique({
            where: { id: responseId },
            select: { response: true },
        });

        if (!existingResponse) {
            throw new Error("Response not found");
        }

        // Clone and update the response JSON
        const updatedResponse = [...existingResponse.response as any[]];
        if (!updatedResponse[question]) {
            throw new Error("Invalid question index");
        }

        updatedResponse[question].score = score;

        // // Save the updated response
        await prisma.response.update({
            where: { id: responseId },
            data: {
                response: updatedResponse,
            },
        });
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