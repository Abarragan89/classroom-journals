"use server"
import { prisma } from "@/db/prisma";
import { promptSchema } from "../validators";
import { SearchOptions, Question, Prompt } from "@/types";
import { ClassUserRole, Prisma, PromptSessionStatus, PromptType, ResponseStatus } from '@prisma/client';
import { requireAuth } from "./authorization.action";

// Create new prompt 
export async function createNewPrompt(prevState: unknown, formData: FormData) {
    try {
        // Verify Teacher Id
        const teacherId = formData.get('teacherId')
        if (typeof teacherId !== 'string') {
            throw new Error('Missing teacher ID');
        }
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden');
        }

        // make arrays for questions
        const questions: Question[] = [];
        const classesAssignTo: string[] = []

        // Extract all questions from formData & dump into questions[]
        formData.forEach((value, key) => {
            if (key.startsWith("question")) {
                questions.push({ question: (value as string).trim() }); // Convert into correct format
            }
            if (key.startsWith("classroom-assign")) {
                classesAssignTo.push(value as string)
            }
        });

        // Get title for prompt(only searchable text)
        const title = formData.get("title") as string || "";
        const isPublic = formData.get('is-public');
        const enbaledSpellCheck = formData.get('enable-spellcheck')
        let categoryId = formData.get("prompt-category") as string | null;

        if (categoryId === "no-category" || categoryId === undefined) {
            categoryId = null;
        }

        if (!title) {
            return { success: false, message: "Title is required" };
        }


        // Get Prompt Type
        const promptType = formData.get("prompt-type") as string;

        if (promptType === 'BLOG') {
            // Add blog-title and blog-image questions if a journal prompt
            questions.push({ question: 'Add a Blog Title' })
            questions.push({ question: 'Add a Cover Photo' })
        }

        // Validate using Zod
        const validationResult = promptSchema.safeParse({
            title,
            questions,
            promptType
        });
        // Check for validation error
        if (!validationResult.success) {
            console.log("Validation failed:", validationResult.error.format());
            return { success: false, message: "Missing a required field" };
        }

        const finalTransaction = await prisma.$transaction(async (prisma) => {
            // Create the Prompt
            const createdPrompt = await prisma.prompt.create({
                data: {
                    title: title.trim(),
                    teacherId,
                    promptType: promptType === 'BLOG' ? PromptType.BLOG : PromptType.ASSESSMENT,
                    categoryId,
                    questions: questions as unknown as Prisma.InputJsonValue,
                },
            });

            // This is where the prompt can be assigned if  the user is subscribed and has enough space
            const promptSessionCount = await prisma.promptSession.count({
                where: {
                    prompt: {
                        teacherId: teacherId, // the teacher's UUID
                    },
                },
            });

            // Check if teacher is allowed to add a new prompts
            const currentTeacherClassData = await prisma.user.findUnique({
                where: { id: teacherId },
                select: {
                    subscriptionExpires: true,
                    _count: {
                        select: {
                            prompts: true,
                        }
                    }
                }
            })

            const today = new Date();
            const { subscriptionExpires } = currentTeacherClassData || {};
            const isSubscribed = subscriptionExpires && subscriptionExpires > today;

            let isAllowedToAssign = false;
            if (isSubscribed) {
                isAllowedToAssign = true;
            } else if (!isSubscribed && promptSessionCount < 5) {
                isAllowedToAssign = true;
            }

            if (!isAllowedToAssign && classesAssignTo.length > 0) {
                return { success: false, message: 'Assignment limit reached. You can create prompts, but assigning them to classes requires account upgrade or deleting old assignments' }
            }

            // Create PromptSessions if there are classes to assign
            if (classesAssignTo.length > 0) {
                const promptSessions = classesAssignTo.map((classId) => ({
                    promptId: createdPrompt.id,
                    title: createdPrompt.title,
                    promptType: createdPrompt.promptType,
                    isPublic: isPublic === 'true' ? true : false,
                    questions: createdPrompt.questions as Prisma.InputJsonValue,
                    assignedAt: new Date(),
                    classId: classId,
                    status: PromptSessionStatus.OPEN
                }));

                // Create all the PromptSessions in one transaction
                await prisma.promptSession.createMany({
                    data: promptSessions,
                });
                // Now create the Responses for each student

                // Step 1: Fetch the new PromptSessions that were just created
                const createdPromptSessions = await prisma.promptSession.findMany({
                    where: {
                        promptId: createdPrompt.id,
                        classId: {
                            in: classesAssignTo,
                        },
                    },
                    select: {
                        id: true,
                        classId: true,
                    },
                });


                const classUsers = await prisma.classUser.findMany({
                    where: {
                        classId: {
                            in: classesAssignTo
                        },
                        role: ClassUserRole.STUDENT
                    },
                    select: {
                        userId: true,
                        classId: true,
                    }
                })

                // Step 3: Map each student to the correct PromptSession and build responses
                const responsesToCreate = classUsers.flatMap(classUser => {
                    return createdPromptSessions
                        .filter(session => session.classId === classUser.classId)
                        .map(session => ({
                            studentId: classUser.userId,
                            promptSessionId: session.id,
                            spellCheckEnabled: enbaledSpellCheck === 'true' ? true : false,
                            completionStatus: ResponseStatus.INCOMPLETE,
                            response: createdPrompt.questions as Prisma.InputJsonValue, // or an empty object if you prefer
                        }));
                });

                // Step 4: Create all the responses
                if (responsesToCreate.length > 0) {
                    await prisma.response.createMany({
                        data: responsesToCreate,
                    });
                }
            }
            return { success: true, message: 'Prompt Created!' };
        })
        return finalTransaction;

    } catch (error) {
        // Improved error logging
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
            return { success: false, message: error.message as unknown as string }
        } else {
            console.log('Unexpected error:', error);
            return { success: false, message: 'Error adding prompt' }
        }
    }
}

// Update a prompt
export async function updateAPrompt(prevState: unknown, formData: FormData) {
    try {
        // Verify Teacher Id
        const teacherId = formData.get('teacherId');
        if (typeof teacherId !== 'string') {
            throw new Error('Missing teacher ID');
        }
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden');
        }

        const questions: Question[] = [];
        const classesAssignTo: string[] = []

        // Extract all questions from formData & dump into questions[]
        formData.forEach((value, key) => {
            if (key.startsWith("question")) {
                questions.push({ question: (value as string).trim() }); // Convert into correct format
            }
            if (key.startsWith("classroom-assign")) {
                classesAssignTo.push(value as string)
            }
        });

        // Get & Validate Prompt Title
        const title = formData.get("title") as string || "";
        const isPublic = formData.get('is-public');
        let categoryId = formData.get("prompt-category") as string | null;
        const enbaledSpellCheck = formData.get('enable-spellcheck')

        if (categoryId === "no-category" || categoryId === undefined) {
            categoryId = null;
        }

        if (!title) {
            return { success: false, message: "Title is required" };
        }

        // Get & Validate Prompt ID
        const promptId = formData.get("promptId")?.toString().trim() || "";
        if (!promptId) {
            return { success: false, message: "Prompt ID is required" };
        }

        const promptType = formData.get("prompt-type") as string;

        if (promptType === 'BLOG') {
            // Add blog-title and blog-image questions if a journal prompt
            questions.push({ question: 'Add a Blog Title' })
            questions.push({ question: 'Add a Cover Photo' })
        }

        // Validate using Zod
        const validationResult = promptSchema.safeParse({ title, questions });
        if (!validationResult.success) {
            console.log("Validation failed:", validationResult.error.format());
            return { success: false, message: "Complete question required" };
        }

        // Fetch existing prompt data
        const existingPrompt = await prisma.prompt.findUnique({
            where: { id: promptId },
            select: { id: true }
        });

        if (!existingPrompt) {
            return { success: false, message: "Prompt not found" };
        }

        // Perform update
        await prisma.$transaction(async (prisma) => {
            const updatedPrompt = await prisma.prompt.update({
                where: { id: promptId },
                data: {
                    title: title.trim(),
                    teacherId,
                    categoryId,
                    questions: questions as unknown as Prisma.InputJsonValue,
                },
            });

            // Create PromptSessions if there are classes to assign
            if (classesAssignTo.length > 0) {
                const promptSessions = classesAssignTo.map((classId) => ({
                    promptId: updatedPrompt.id,
                    title: updatedPrompt.title,
                    promptType: updatedPrompt.promptType,
                    isPublic: isPublic === 'true' ? true : false,
                    questions: updatedPrompt.questions as Prisma.InputJsonValue,
                    assignedAt: new Date(),
                    classId: classId,
                    status: PromptSessionStatus.OPEN
                }));

                // Create all the PromptSessions in one transaction
                await prisma.promptSession.createMany({
                    data: promptSessions,
                });
                // Now create the Responses for each student

                // Step 1: Fetch the new PromptSessions that were just created
                const createdPromptSessions = await prisma.promptSession.findMany({
                    where: {
                        promptId: updatedPrompt.id,
                        classId: {
                            in: classesAssignTo,
                        },
                    },
                    select: {
                        id: true,
                        classId: true,
                    },
                });


                const classUsers = await prisma.classUser.findMany({
                    where: {
                        classId: {
                            in: classesAssignTo
                        },
                        role: ClassUserRole.STUDENT
                    },
                    select: {
                        userId: true,
                        classId: true,
                    }
                })

                // Step 3: Map each student to the correct PromptSession and build responses
                const responsesToCreate = classUsers.flatMap(classUser => {
                    return createdPromptSessions
                        .filter(session => session.classId === classUser.classId)
                        .map(session => ({
                            studentId: classUser.userId,
                            promptSessionId: session.id,
                            spellCheckEnabled: enbaledSpellCheck === 'true' ? true : false,
                            completionStatus: ResponseStatus.INCOMPLETE,
                            response: updatedPrompt.questions as Prisma.InputJsonValue, // or an empty object if you prefer
                        }));
                });

                // Step 4: Create all the responses
                if (responsesToCreate.length > 0) {
                    await prisma.response.createMany({
                        data: responsesToCreate,
                    });
                }
            }
        })
        return { success: true, message: 'Prompt Updated!' };

    } catch (error) {
        if (error instanceof Error) {
            console.error('Error updating prompt:', error.message);
            console.error(error.stack);
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error updating prompt. Try again.' };
    }
}

// Get all prompts of Teacher
export async function getAllTeacherPrompts(teacherId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden');
        }
        const [totalCount, paginatedPrompts] = await Promise.all([
            prisma.prompt.count({ where: { teacherId } }), // Get total count
            prisma.prompt.findMany({
                where: { teacherId },
                select: {
                    id: true,
                    title: true,
                    promptType: true,
                    createdAt: true,
                    updatedAt: true,
                    questions: true,
                    category: { select: { name: true } },
                    promptSession: {
                        select: {
                            assignedAt: true,
                            class: { select: { id: true, name: true } },
                        },
                    },
                },
                orderBy: { updatedAt: 'desc' },
                take: 20
            }),
        ]);

        return { totalCount, prompts: paginatedPrompts };

    } catch (error) {
        // Improved error logging
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }

        return { success: false, message: 'Error creating prompt. Try again.' }
    }
}

// Get a single prompt based on Id
export async function getSinglePrompt(promptId: string, teacherId: string) {
    try {
        const session = await requireAuth();

        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden')
        }

        const prompt = await prisma.prompt.findUnique({
            where: { id: promptId },
            include: {
                category: {
                    select: {
                        name: true,
                        id: true,
                    }
                },
                promptSession: {
                    select: {
                        assignedAt: true,
                        class: {
                            select: {
                                id: true,
                                name: true
                            },
                        }
                    },
                }
            },
        })
        return prompt
    } catch (error) {
        // Improved error logging
        if (error instanceof Error) {
            console.log('Error getting single prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }

        return { success: false, message: 'Error creating prompt. Try again.' }
    }
}

// Get prompts based on filtered options
export async function getFilterPrompts(filterOptions: SearchOptions, teacherId: string) {
    try {
        const session = await requireAuth();

        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden')
        }
        const allPrompts = await prisma.prompt.findMany({
            where: {
                teacherId,
                // 1️ Filter by classroom if specified
                categoryId: filterOptions.category
                    ? filterOptions.category
                    : undefined,
                // 2️ Filter by keywords in the title
                title: filterOptions.searchWords
                    ? { contains: filterOptions.searchWords, mode: "insensitive" }
                    : undefined,
                promptSession: filterOptions.filter === 'never-assigned'
                    ? { none: {} }
                    : undefined,
                promptType: filterOptions.filter === 'BLOG' || filterOptions.filter === 'ASSESSMENT'
                    ? filterOptions.filter
                    : undefined
            },
            include: {
                category: true,
                promptSession: {
                    select: {
                        assignedAt: true,
                        class: {
                            select: {
                                id: true,
                                name: true
                            },
                        }
                    },
                }
            },
            take: 20,
            orderBy: {
                updatedAt: filterOptions.filter === 'asc' ? 'asc' : 'desc'
            },
            skip: filterOptions.paginationSkip, // paginaction filter
        });

        return allPrompts;
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


export async function assignPrompt(prevState: unknown, formData: FormData) {
    try {
        const teacherId = formData.get('teacherId') as string;

        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden');
        }
        // Check subscription and limits
        const promptSessionCount = await prisma.promptSession.count({
            where: {
                prompt: {
                    teacherId,
                },
            },
        });

        const currentTeacherClassData = await prisma.user.findUnique({
            where: { id: teacherId },
            select: {
                subscriptionExpires: true,
                _count: { select: { prompts: true } }
            }
        });

        const today = new Date();
        const { subscriptionExpires } = currentTeacherClassData || {};
        const isSubscribed = subscriptionExpires && subscriptionExpires > today;

        const isAllowedToAssign = isSubscribed || (!isSubscribed && promptSessionCount < 5);

        if (!isAllowedToAssign) {
            return { success: false, message: 'Assignment limit reached. You can create prompts, but assigning them to classes requires account upgrade or deleting old assignments' };
        }

        const promptId = formData.get('promptId') as string;
        const isPublic = formData.get('is-public');
        const enbaledSpellCheck = formData.get('enable-spellcheck')
        const classesAssignTo: string[] = [];

        formData.forEach((value, key) => {
            if (key.startsWith("classroom")) {
                classesAssignTo.push(value as string);
            }
        });

        if (classesAssignTo.length < 1) {
            return { success: false, message: 'At least one class needs to be selected.' };
        }

        const currentPrompt = await prisma.prompt.findUnique({
            where: { id: promptId },
            select: {
                id: true,
                title: true,
                questions: true,
                promptType: true,
                category: true
            }
        });

        if (!currentPrompt) {
            return { success: false, message: 'No prompt exists with that ID' };
        }

        // Execute everything in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create prompt sessions
            const createdPromptSessions = await Promise.all(
                classesAssignTo.map((classId) =>
                    tx.promptSession.create({
                        data: {
                            promptId: currentPrompt.id,
                            title: currentPrompt.title,
                            promptType: currentPrompt.promptType,
                            isPublic: isPublic === 'true',
                            questions: currentPrompt.questions as Prisma.InputJsonValue,
                            assignedAt: new Date(),
                            classId,
                            status: PromptSessionStatus.OPEN,
                        },
                        select: {
                            id: true,
                            classId: true,
                        },
                    })
                )
            );

            // 3. Fetch class users
            const classUsers = await tx.classUser.findMany({
                where: {
                    classId: { in: classesAssignTo },
                    role: ClassUserRole.STUDENT,
                },
                select: {
                    userId: true,
                    classId: true,
                },
            });

            // 4. Generate responses for each student in each session
            const responsesToCreate = classUsers.flatMap((classUser) => {
                return createdPromptSessions
                    .filter((session) => session.classId === classUser.classId)
                    .map((session) => ({
                        studentId: classUser.userId,
                        promptSessionId: session.id,
                        spellCheckEnabled: enbaledSpellCheck === 'true' ? true : false,
                        completionStatus: ResponseStatus.INCOMPLETE,
                        response: currentPrompt.questions as Prisma.InputJsonValue,
                    }));
            });

            if (responsesToCreate.length > 0) {
                await tx.response.createMany({
                    data: responsesToCreate,
                });
            }

            // 5. Return the updated prompt
            return await tx.prompt.findUnique({
                where: { id: promptId },
                include: {
                    category: true,
                    promptSession: {
                        select: {
                            assignedAt: true,
                            class: {
                                select: {
                                    id: true,
                                    name: true
                                },
                            }
                        },
                    }
                },
            });
        });

        return { success: true, message: 'Prompt Assigned and Responses Created!', data: result as unknown as Prompt };
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error assigning prompt:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }
        return { success: false, message: "Error assigning prompt. Try again." };
    }
}


// Delete Prompt
export async function deletePrompt(prevState: unknown, formData: FormData) {
    try {
        const session = await requireAuth();

        const teacherId = formData.get('teacherId') as string
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden')
        }
        const promptId = formData.get('promptId') as string

        await prisma.prompt.delete({
            where: { id: promptId }
        })
        return { success: true, message: 'Prompt Updated!', promptId };

    } catch (error) {
        if (error instanceof Error) {
            console.log('Error updating prompt:', error.message);
            console.error(error.stack);
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error updating prompt. Try again.' };
    }
}
