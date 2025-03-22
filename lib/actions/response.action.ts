"use server";
import { prisma } from "@/db/prisma";
import { decryptText } from "../utils";

export async function createStudentResponse(prevState: unknown, formData: FormData) {
    try {
        const studentId = formData.get('studentId') as string;
        const promptSessionId = formData.get('promptSessionId') as string;
        const responseData = formData.get('responseData') as string;
        const response = JSON.parse(responseData);

        console.log('prompt session ', promptSessionId)

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
        // @ts-expect-error: may be error  with typing response
        const updatedResponse = [...existingResponse.response as InputJsonValue[]];
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
                id: true,
                likes: true,
                likeCount: true,
                submittedAt: true,
                response: true,
                _count: {
                    select: { comments: true }
                },
                comments: {
                    where: {
                        parentId: null
                    },
                    orderBy: {
                        likeCount: 'desc'
                    },
                    select: {
                        user: {
                            select: {
                                username: true,
                                iv: true
                            }
                        },
                        replies: {
                            orderBy: {
                                likeCount: 'desc'
                            },
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


export async function toggleResponseLike(responseId: string, userId: string) {
    try {
        // Start a transaction
        await prisma.$transaction(async (prisma) => {
            // Check if the user has already liked the comment
            const existingLike = await prisma.responseLike.findUnique({
                where: { userId_responseId: { userId, responseId } }
            });

            if (!existingLike) {
                // Add a new like if not already liked
                await prisma.responseLike.create({
                    data: {
                        userId,
                        responseId
                    }
                });

                // Update the comment's likes
                await prisma.response.update({
                    where: { id: responseId },
                    data: { likeCount: { increment: 1 } }
                });
            } else if (existingLike) {
                // Remove the like if the user is unliking the comment
                await prisma.responseLike.delete({
                    where: { userId_responseId: { userId, responseId } }
                });

                // Decrement the likes on the comment
                await prisma.response.update({
                    where: { id: responseId },
                    data: { likeCount: { decrement: 1 } }
                });
            }
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