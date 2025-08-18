import { SearchOptions } from "@/types";
import { requireAuth } from "../actions/authorization.action";
import { prisma } from "@/db/prisma";

// Get all prompts of Teacher
export async function getAllTeacherPrompts(teacherId: string) {
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
}

// Get a single prompt based on Id
export async function getSinglePrompt(promptId: string, teacherId: string) {
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
}

// Get prompts based on filtered options
export async function getFilterPrompts(filterOptions: SearchOptions, teacherId: string) {
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
}
