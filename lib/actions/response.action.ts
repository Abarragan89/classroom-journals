"use server";
import { prisma } from "@/db/prisma";
import { decryptText } from "../utils";

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

// Get a single response with comments
export async function getSingleResponse(responseId: string) {
    try {
        if (!responseId) {
            return { success: false, message: "Response Id required." }
        }
        const response = await prisma.response.findUnique({
            where: { id: responseId },
            select: {
                submittedAt: true,
                response: true,
                comments: {
                    where: {
                        parentId: null
                    },
                    select: {
                        user: {
                            select: {
                                username: true,
                                iv: true
                            }
                        },
                        replies: {
                            select: {
                                user: {
                                    select: {
                                        username: true,
                                        iv: true
                                    }
                                },
                                likes: {
                                    select: {
                                        userId: true,
                                        commentId: true,
                                        id: true,
                                    }
                                },
                                likeCount: true,
                                text: true,
                                createdAt: true,
                                id: true
                            }
                        },
                        likes: {
                            select: {
                                userId: true,
                                commentId: true,
                                id: true,
                            }
                        },
                        likeCount: true,
                        createdAt: true,
                        id: true,
                        text: true
                    }
                },
                student: {
                    select: {
                        id: true,
                        username: true,
                        iv: true,
                    }
                }
            }
        })

        // with the name decoded
        const formattedResponse = {
            ...response,
            student: {
                id: response?.student.id,
                username: decryptText(response?.student.username as string, response?.student.iv as string)
            },
            comments: response?.comments.map(comment => ({
                ...comment,
                user: {
                    ...comment.user,
                    username: decryptText(comment.user.username as string, comment.user.iv as string)
                },
                replies: comment.replies.map(reply => ({
                    ...reply,
                    user: {
                        ...reply.user,
                        username: decryptText(reply.user.username as string, reply.user.iv as string)
                    }
                }))
            }))
        }
        console.log('get singe reposne total', formattedResponse)
        return formattedResponse
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