"use server";
import { prisma } from "@/db/prisma";
import { decryptText } from "../utils";
import { ResponseData } from "@/types";
import { JsonValue } from "@prisma/client/runtime/library";
import { gradeResponseWithAI } from "./openai.action";

export async function createStudentResponse(prevState: unknown, formData: FormData) {
    try {
        const studentId = formData.get('studentId') as string;
        const promptSessionId = formData.get('promptSessionId') as string;
        const responseData = formData.get('responseData') as string;
        const promptType = formData.get('promptType') as string;
        const gradeLevel = formData.get('grade-level') as string;
        const isTeacherPremium = formData.get('is-teacher-premium') as string
        let response = JSON.parse(responseData);

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

        // Grade it with AI Only if premium member and multiple questions
        if (promptType === 'multi-question' && isTeacherPremium === 'true') {
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

        await prisma.response.create({
            data: {
                promptSessionId,
                studentId,
                response,
                submittedAt: new Date(),
            }
        })

        return { success: true, message: "responses submitted" };

    } catch (error) {
        if (error instanceof Error) {
            console.log("Error creating student response:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }

        return { success: false, message: "Error fetching prompts. Try again." };
    }
}

// Get Single Response for Resubmission
export async function updateASingleResponse(
    responseId: string,
    responseData: ResponseData[],
    submittedAt: Date,
    // These are only for multi-question prompts
    promptType?: string,
    isTeacherPremium?: boolean,
    gradeLevel?: string
) {
    try {

        // Grade it with AI Only if premium member
        if (promptType === 'multi-question' && isTeacherPremium && gradeLevel) {
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
                isSubmittable: false,
                submittedAt
            }
        })

        return { success: true, message: "Error fetching prompts. Try again." };
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

// Get a single response with comments for blog Display
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
                isSubmittable: true,
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
                        name: true,
                        iv: true,
                    }
                },
                promptSession: {
                    select: {
                        status: true,
                        promptType: true,
                    }
                }
            }
        })

        // with the name decoded
        const formattedResponse = {
            ...response,
            student: {
                id: response?.student.id,
                name: decryptText(response?.student.name as string, response?.student.iv as string),
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


// Get all responses user's names and score for combobox in single Response
export async function getAllResponsesFromPompt(promptSessionId: string) {
    try {
        if (!promptSessionId) {
            return { success: false, message: "Response Id required." }
        }
        const responses = await prisma.response.findMany({
            where: { promptSessionId: promptSessionId },
            select: {
                id: true,
                response: true,
                student: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        iv: true,
                    }
                },
                promptSession: {
                    select: {
                        promptType: true,
                    }
                }
            }
        })

        const withDecodedNames = [...responses.map(response => {
            // Calculate Percentage score
            const responsesArr = (response?.response as unknown as ResponseData[])
            let score = "Not Graded"
            const isMultiQuestion = response.promptSession.promptType === 'multi-question'

            if (isMultiQuestion) {
                const numberScore = responsesArr?.reduce((accum, currVal) => currVal?.score + accum, 0)
                if (isNaN(numberScore)) {
                    score = 'Not Graded'
                } else if (numberScore === 0) {
                    score = '0%'
                } else {
                    score = ((parseFloat((numberScore / responsesArr.length).toFixed(2)) * 100).toString() + '%');
                }
            } else {
                const isItScored = (responsesArr?.[0].score)?.toString()
                score = isItScored ? isItScored + '%' : 'Not Graded'
            }
            return (
                {
                    id: response.id,
                    score,
                    student: {
                        name: decryptText(response?.student?.name as string, response?.student?.iv as string)
                    }
                }
            )
        })]
        return withDecodedNames
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

// Get All responses from a single student
export async function getSingleStudentResponses(studentId: string) {
    try {
        const studentResponses = await prisma.response.findMany({
            where: {
                studentId
            },
            select: {
                id: true,
                response: true,
                submittedAt: true,
                likeCount: true,
                _count: {
                    select: {
                        comments: true,
                    }
                },
                isSubmittable: true,
                promptSession: {
                    select: {
                        id: true,
                        promptType: true,
                        title: true,
                        areGradesVisible: true,
                    }
                }
            },
            orderBy: [
                { isSubmittable: 'desc' }, // Puts submittable responses (true) first
                { submittedAt: 'desc' }    // Orders by submittedAt date (latest first)
            ]
        })

        return studentResponses
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

// Get Single Response for Resubmission
export async function getSingleResponseForReview(responseId: string) {
    try {
        const studentResponse = await prisma.response.findUnique({
            where: { id: responseId },
            select: {
                id: true,
                response: true,
                isSubmittable: true,
                promptSession: {
                    select: {
                        id: true,
                        promptType: true,
                        isPublic: true,
                        questions: true,
                        areGradesVisible: true,
                        title: true
                    }
                }
            }
        })
        return studentResponse
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

// Get toggle return state of a single response
export async function toggleReturnStateStatus(responseId: string, isSubmittable: boolean) {
    try {
        await prisma.response.update({
            where: { id: responseId },
            data: {
                isSubmittable: isSubmittable
            }
        })
        return { success: true, message: "Error fetching prompts. Try again." };
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

// Get toggle return state of a single response
export async function toggleHideShowGrades(promptSessionId: string, areGradesVisible: boolean) {
    try {
        await prisma.promptSession.update({
            where: { id: promptSessionId },
            data: {
                areGradesVisible
            }
        })
        return { success: true, message: "Error toggling show/hide grades update. Try again." };
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

// Delete Response
export async function deleteResponse(prevState: unknown, formData: FormData) {
    try {
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
            console.log('Error deleting prompt:', error.message);
            console.error(error.stack);
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error deleting prompt. Try again.' };
    }
}
