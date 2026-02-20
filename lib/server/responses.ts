import { ResponseData, SearchOptions, Session } from "@/types";
import { requireAuth } from "../actions/authorization.action";
import { decryptText } from "../utils";
import { prisma } from "@/db/prisma";
import { PromptType } from "@prisma/client";

// Get a single response with comments for blog Display
export async function getSingleResponse(responseId: string, userId: string, sessionParam?: Session) {
    const session = sessionParam || await requireAuth();
    if (session?.user?.id !== userId) {
        throw new Error("Forbidden");
    }

    if (!responseId) {
        throw new Error("Response Id required");
    }

    const response = await prisma.response.findUnique({
        where: { id: responseId },
        select: {
            id: true,
            promptSessionId: true,
            studentId: true,
            createdAt: true,
            likes: true,
            likeCount: true,
            submittedAt: true,
            spellCheckEnabled: true,
            isVoiceToTextEnabled: true,
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
            },
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
                avatarURL: comment.user.avatarURL,
                username: decryptText(comment.user.username as string, comment.user.iv as string)
            },
            replies: comment.replies.map(reply => ({
                ...reply,
                user: {
                    avatarURL: reply.user.avatarURL,
                    username: decryptText(reply.user.username as string, reply.user.iv as string)
                }
            }))
        }))
    };

    return formattedResponse;
}
// Get all responses user's names and score for combobox in single Response
export async function getAllResponsesFromPrompt(promptSessionId: string, teacherId: string) {
    const session = await requireAuth();
    if (session?.user?.id !== teacherId) {
        throw new Error("Forbidden");
    }

    if (!promptSessionId) {
        throw new Error("Prompt session ID required");
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
            },
            rubricGrades: {
                select: {
                    percentageScore: true,
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
                score = Math.round((numberScore / responsesArr.length) * 100) + '%';
            }
        } else {
            if (response.rubricGrades && response.rubricGrades.length > 0) {
                score = response.rubricGrades[0].percentageScore + '%'
            } else {
                const isItScored = (responsesArr?.[0].score)?.toString()
                score = isItScored ? isItScored + '%' : 'Not Graded'
            }
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

    return withDecodedNames;
}

// Get All responses from a single student for 'My-Work'
export async function getSingleStudentResponses(studentId: string) {
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

    return studentResponses;
}


// Get student responses for student Dashboard. Pagination count and only first 30
export async function getStudentResponsesDashboard(studentId: string, sessionParam?: Session) {
    const session = sessionParam || await requireAuth();
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
                response: true,
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

    return { totalCount, responses: paginatedResponses };
}

// Filtered responses for student dashboard
export async function getFilteredStudentResponses(filterOptions: SearchOptions, studentId: string) {
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
            completionStatus: true,
            response: true,
            createdAt: true,
            
            promptSession: {
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    promptType: true,
                    areGradesVisible: true,
                    status: true,
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
}


// Get Single Response for sub
export async function getSingleResponseForReview(responseId: string, studentId: string) {
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
            isVoiceToTextEnabled: true,
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

    return decryptedResponse;
}