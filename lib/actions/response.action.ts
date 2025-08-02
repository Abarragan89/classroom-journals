"use server";
import { prisma } from "@/db/prisma";
import { decryptText } from "../utils";
import { ResponseData, SearchOptions } from "@/types";
import { InputJsonArray, JsonValue } from "@prisma/client/runtime/library";
import { gradeResponseWithAI } from "./openai.action";
import { PromptType, ResponseStatus } from "@prisma/client";
import { requireAuth } from "./authorization.action";

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
                success: true,
                message: "You have already submitted your responses."
            };
        }

        await prisma.response.create({
            data: {
                promptSessionId,
                studentId,
                response: questions as unknown as InputJsonArray,
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

// update the responseData only on the student response
export async function updateStudentResponse(responseData: ResponseData[], responseId: string, studentId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== studentId) {
            throw new Error("Forbidden");
        }
        await prisma.response.update({
            where: { id: responseId },
            data: {
                response: responseData as unknown as InputJsonArray
            }
        })
        return { success: true, message: "Updated student Response data" };
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
            console.log("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
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
            console.log("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }

        return { success: false, message: "Error fetching prompts. Try again." };
    }
}

// Get a single response with comments for blog Display
export async function getSingleResponse(responseId: string, userId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== userId) {
            throw new Error("Forbidden");
        }

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
                spellCheckEnabled: true,
                response: true,
                completionStatus: true,
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
                                iv: true,
                                avatarURL: true,
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
                                        iv: true,
                                        avatarURL: true,
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
                        avatarURL: true,
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
                avatarURL: response?.student.avatarURL,
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
export async function getAllResponsesFromPompt(promptSessionId: string, teacherId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error("Forbidden");
        }
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
            const isMultiQuestion = response.promptSession.promptType === PromptType.ASSESSMENT

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
            console.log("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }

        return { success: false, message: "Error fetching prompts. Try again." };
    }
}

// Get All responses from a single student for 'My-Work'
export async function getSingleStudentResponses(studentId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== studentId) {
            throw new Error("Forbidden");
        }
        const studentResponses = await prisma.response.findMany({
            where: {
                studentId,
                promptSession: {
                    promptType: { in: ['BLOG', 'ASSESSMENT'] },
                }
            },
            select: {
                id: true,
                response: true,
                createdAt: true,
                submittedAt: true,
                completionStatus: true,
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


// Get student responses for student Dashboard. Pagination count and only first 30
export async function getStudentResponsesDashboard(studentId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== studentId) {
            throw new Error("Forbidden");
        }
        const [totalCount, paginatedResponses] = await Promise.all([
            prisma.response.count({ where: { studentId } }),
            prisma.response.findMany({
                where: {
                    studentId,
                    promptSession: {
                        promptType: { in: ['BLOG', 'ASSESSMENT'] },
                    }
                },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    studentId: true,
                    completionStatus: true,
                    createdAt: true,
                    promptSession: {
                        select: {
                            id: true,
                            promptType: true,
                            title: true,
                            areGradesVisible: true,
                            prompt: {
                                select: {
                                    category: {
                                        select: {
                                            name: true,
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })
        ])
        return { totalCount, responses: paginatedResponses }
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

// Filtered responses for student dashboard
export async function getFilteredStudentResponses(filterOptions: SearchOptions, studentId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== studentId) {
            throw new Error('Forbidden')
        }

        const responses = await prisma.response.findMany({
            where: {
                studentId,
                // Optional filter by prompt category
                promptSession: {
                    prompt: {
                        categoryId: filterOptions.category || undefined,
                    },
                    title: filterOptions.searchWords
                        ? { contains: filterOptions.searchWords, mode: 'insensitive' }
                        : undefined,
                    promptType:
                        filterOptions.filter === 'BLOG' || filterOptions.filter === 'ASSESSMENT'
                            ? filterOptions.filter
                            : { in: ['BLOG', 'ASSESSMENT'] },

                },
            },
            select: {
                id: true,
                studentId: true,
                submittedAt: true,
                createdAt: true,
                promptSession: {
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                        promptType: true,
                        prompt: {
                            select: {
                                category: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            take: 30,
            orderBy: {
                promptSession: {
                    createdAt: filterOptions.filter === 'asc' ? 'asc' : 'desc',
                },
            },
            skip: filterOptions.paginationSkip,
        });

        return responses;
    } catch (error) {
        console.error('Error fetching filtered student responses:', error);
        throw new Error('Failed to get filtered student responses');
    }
}

// Get all responses associated with a response. 

// Get Single Response for sub
export async function getSingleResponseForReview(responseId: string, studentId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== studentId) {
            throw new Error('Forbidden')
        }
        const studentResponse = await prisma.response.findUnique({
            where: { id: responseId },
            select: {
                id: true,
                response: true,
                completionStatus: true,
                spellCheckEnabled: true,
                rubricGrades: {
                    select: {
                        id: true,
                        categories: true,
                        totalScore: true,
                        maxTotalScore: true,
                        percentageScore: true,
                        comment: true,
                        gradedAt: true,
                        rubric: {
                            select: {
                                id: true,
                                title: true,
                                categories: true
                            }
                        }
                    }
                },
                student: {
                    select: {
                        name: true,
                        iv: true
                    }
                },
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

        // Decrypt the student name if it exists
        const decryptedResponse = studentResponse ? {
            ...studentResponse,
            student: studentResponse.student ? {
                name: decryptText(studentResponse.student.name as string, studentResponse.student.iv as string)
            } : null
        } : null;

        return decryptedResponse
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
            console.log("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
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
            console.log("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
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
            console.log("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
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
            console.log('Error deleting prompt:', error.message);
            console.error(error.stack);
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error deleting prompt. Try again.' };
    }
}
