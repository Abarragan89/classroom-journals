"use server";
import { prisma } from "@/db/prisma";
import { ResponseData } from "@/types";
import { InputJsonArray, JsonValue } from "@prisma/client/runtime/library";
import { gradeResponseWithAI } from "./openai.action";
import { ResponseStatus } from "@prisma/client";
import { requireAuth } from "./authorization.action";
import { decryptText } from "../utils";

// Create  a single response to a student
export async function createStudentResponse(
    promptSessionId: string,
    studentId: string,
    teacherId: string,
    questions: ResponseData[],
) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error("Forbidden");
        }
        // Check to see if submission from student ahs already been made. 
        const existingResponses = await prisma.promptSession.findUnique({
            where: { id: promptSessionId },
            select: {
                responses: {
                    select: {
                        student: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            }
        })
        // Check if the studentId already exists
        const hasSubmitted = existingResponses?.responses.some(
            (res) => res.student.id === studentId
        );

        if (hasSubmitted) {
            return {
                success: false,
                message: "You have already submitted your responses."
            };
        }

        const newResponse = await prisma.response.create({
            data: {
                promptSessionId,
                studentId,
                response: questions as unknown as InputJsonArray,
            },
            select: {
                id: true,
                promptSessionId: true,
                studentId: true,
                response: true,
                submittedAt: true,
                completionStatus: true,
                likeCount: true,
                spellCheckEnabled: true,
                createdAt: true,
                likes: {
                    select: {
                        userId: true,
                        id: true,
                    }
                },
                _count: {
                    select: {
                        comments: true
                    }
                },
                comments: {
                    select: {
                        id: true,
                        createdAt: true,
                        userId: true,
                        responseId: true,
                    }
                },
                rubricGrades: {
                    select: {
                        id: true,
                        categories: true,
                        totalScore: true,
                        maxTotalScore: true,
                        percentageScore: true,
                        comment: true,
                        rubricId: true,
                    }
                },
                student: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        iv: true,
                        avatarURL: true,
                    }
                },
                promptSession: {
                    select: {
                        id: true,
                        title: true,
                        promptType: true,
                        status: true,
                        classId: true,
                        createdAt: true,
                        updatedAt: true,
                        assignedAt: true,
                        areGradesVisible: true,
                        isPublic: true,
                        questions: true,
                        authorId: true,
                        promptId: true,
                    }
                }
            }
        })

        const decryptedResponse = {
            ...newResponse,
            student: {
                ...newResponse.student,
                iv: undefined,
                name: newResponse.student.name ? decryptText(newResponse.student.name, newResponse.student.iv as string) : null,
                username: newResponse.student.username ? decryptText(newResponse.student.username, newResponse.student.iv as string) : null,
            }
        };

        return { success: true, message: "responses submitted", data: decryptedResponse };

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error creating student response:", error.message);
            console.error(error.stack);
        } else {
            console.error("Unexpected error:", error);
        }
        return { success: false, message: "Error fetching prompts. Try again." };
    }
}

// Get Single Response for Resubmission. Students use this 
export async function updateASingleResponse(
    studentId: string,
    responseId: string,
    responseData: ResponseData[],
    submittedAt: Date,
    // These are only for multi-question prompts
    promptType?: string,
    isTeacherPremium?: boolean,
    gradeLevel?: string
) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== studentId) {
            throw new Error("Forbidden");
        }

        // Check current status first
        const response = await prisma.response.findUnique({
            where: { id: responseId },
            select: { completionStatus: true }
        });

        if (!response) {
            return { success: false, message: "Response not found" };
        }

        // Block if teacher has collected it
        if (response.completionStatus === 'COMPLETE') {
            return {
                success: false,
                isCollected: true,
                message: "This assignment has been collected by your teacher"
            };
        }

        // Grade it with AI Only if premium member
        if (promptType === 'ASSESSMENT' && isTeacherPremium && gradeLevel) {
            let { output_text: scores } = await gradeResponseWithAI(gradeLevel, responseData)
            scores = JSON.parse(scores)
            responseData = responseData.map((res: ResponseData, index: number) => {
                if ((scores[index]) === null) {
                    return ({ ...res })
                } else {
                    return ({ ...res, score: parseFloat(scores[index]) })
                }
            })
        }

        await prisma.response.update({
            where: { id: responseId },
            data: {
                response: responseData as unknown as JsonValue[],
                completionStatus: 'COMPLETE',
                submittedAt
            }
        })
        return { success: true, message: "Response updated successfully" };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.error("Unexpected error:", error);
        }

        return { success: false, message: "Error fetching prompts. Try again." };
    }
}

// update the responseData only on the student response
export async function updateStudentResponse(responseData: ResponseData[], responseId: string, studentId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== studentId) {
            throw new Error("Forbidden");
        }

        // Check current status first
        const response = await prisma.response.findUnique({
            where: { id: responseId },
            select: { completionStatus: true }
        });

        if (!response) {
            return { success: false, message: "Response not found" };
        }

        // Block if teacher has collected it
        if (response.completionStatus === 'COMPLETE') {
            return {
                success: false,
                isCollected: true,
                message: "This assignment has been collected by your teacher"
            };
        }

        // Proceed with update
        await prisma.response.update({
            where: { id: responseId },
            data: {
                response: responseData as unknown as InputJsonArray
            }
        });

        return { success: true, isCollected: false, message: "Updated student Response data" };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error updating response:", error.message);
            console.error(error.stack);
        } else {
            console.error("Unexpected error:", error);
        }
        return { success: false, isCollected: false, message: "Error updating response. Try again." };
    }
}

export async function submitStudentResponse(prevState: unknown, formData: FormData) {
    try {

        const studentId = formData.get('studentId') as string;
        const session = await requireAuth();
        if (session?.user?.id !== studentId) {
            throw new Error("Forbidden");
        }

        const responseId = formData.get('responseId') as string;
        const responseData = formData.get('responseData') as string;
        const promptType = formData.get('promptType') as string;
        const gradeLevel = formData.get('grade-level') as string;
        const isTeacherPremium = formData.get('is-teacher-premium') as string
        let response = JSON.parse(responseData);


        // Grade it with AI Only if premium member and multiple questions
        if (promptType === 'ASSESSMENT' && isTeacherPremium === 'true') {
            let { output_text: scores } = await gradeResponseWithAI(gradeLevel, response)
            scores = JSON.parse(scores)
            response = response.map((res: ResponseData, index: number) => {
                if ((scores[index]) === null) {
                    return ({ ...res })
                } else {
                    return ({ ...res, score: parseFloat(scores[index]) })
                }
            })
        }

        await prisma.response.update({
            where: { id: responseId },
            data: {
                response: response,
                submittedAt: new Date(),
                completionStatus: 'COMPLETE'
            }
        })

        return { success: true, message: "responses submitted" };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error Grading Assessment:", error.message);
            console.error(error.stack);
        } else {
            console.error("Unexpected error:", error);
        }
        return { success: false, message: "Error fetching prompts. Try again." };
    }
}

export async function gradeStudentResponse(responseId: string, question: number, score: number, teacherId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error("Forbidden");
        }

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
            console.error("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.error("Unexpected error:", error);
        }

        return { success: false, message: "Error fetching prompts. Try again." };
    }
}


export async function toggleResponseLike(responseId: string, userId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== userId) {
            throw new Error("Forbidden");
        }
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
            console.error("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.error("Unexpected error:", error);
        }

        return { success: false, message: "Error fetching prompts. Try again." };
    }
}

// Get toggle return state of a single response
export async function toggleReturnStateStatus(responseId: string, responseStatus: ResponseStatus, teacherId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden')
        }
        await prisma.response.update({
            where: { id: responseId },
            data: {
                completionStatus: responseStatus
            }
        })
        return { success: true, message: "Error fetching prompts. Try again." };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.error("Unexpected error:", error);
        }

        return { success: false, message: "Error fetching prompts. Try again." };
    }
}

// Get toggle return state of a single response
export async function toggleHideShowGrades(promptSessionId: string, areGradesVisible: boolean, teacherId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden')
        }
        await prisma.promptSession.update({
            where: { id: promptSessionId },
            data: {
                areGradesVisible
            }
        })
        return { success: true, message: "Error toggling show/hide grades update. Try again." };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.error("Unexpected error:", error);
        }

        return { success: false, message: "Error fetching prompts. Try again." };
    }
}

// Get toggle spell check for a single response
export async function toggleSpellCheck(responseId: string, spellCheckEnabled: boolean, teacherId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden')
        }
        await prisma.response.update({
            where: { id: responseId },
            data: {
                spellCheckEnabled
            }
        })
        return { success: true, message: "Error toggling spell check." };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.error("Unexpected error:", error);
        }

        return { success: false, message: "Error toggling Spell Check" };
    }
}

// Delete Response
export async function deleteResponse(prevState: unknown, formData: FormData) {
    try {
        const teacherId = formData.get('teacherId') as string;
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden')
        }
        const responseId = formData.get('response-id') as string;

        if (!responseId) {
            return { success: false, message: 'Error deleting prompt. Try again.' };
        }

        await prisma.response.delete({
            where: { id: responseId }
        })
        return { success: true, message: 'Prompt Updated!', responseId };

    } catch (error) {
        if (error instanceof Error) {
            console.error('Error deleting prompt:', error.message);
            console.error(error.stack);
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error deleting prompt. Try again.' };
    }
}
