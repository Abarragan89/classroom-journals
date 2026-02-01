import { requireAuth } from "../actions/authorization.action";
import { prisma } from "@/db/prisma";

// Get all rubric grades for a response (if multiple rubrics were used)
export async function getRubricGradesForResponse(responseId: string) {
    const session = await requireAuth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    const rubricGrades = await prisma.rubricGrade.findMany({
        where: { responseId },
        include: {
            rubric: {
                select: {
                    id: true,
                    title: true,
                    categories: true
                }
            }
        },
        orderBy: { gradedAt: 'desc' }
    });

    return rubricGrades;
}

// Grab all rubrics for a teacher (full data - keep for backward compatibility)
// export async function getRubricsByTeacherId(teacherId: string) {
//     const session = await requireAuth();
//     if (session?.user?.id !== teacherId) {
//         throw new Error("Forbidden");
//     }

//     const rubrics = await prisma.rubricTemplate.findMany({
//         where: { teacherId },
//         orderBy: { createdAt: 'desc' },
//     });

//     return rubrics;
// }


// Grab all rubrics for a teacher (lightweight - only id and title)
export async function getRubricListByTeacherId(teacherId: string) {
    const session = await requireAuth();
    if (session?.user?.id !== teacherId) {
        throw new Error("Forbidden");
    }

    const rubrics = await prisma.rubricTemplate.findMany({
        where: { teacherId },
        select: {
            id: true,
            title: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' },
    });

    return rubrics;
}

// get a single rubric by id
export async function getRubricById(rubricId: string) {
    const session = await requireAuth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    const rubric = await prisma.rubricTemplate.findUnique({
        where: { id: rubricId },
    });

    if (!rubric) {
        throw new Error("Rubric not found");
    }
    
    if (rubric.teacherId !== session.user.id) {
        throw new Error("Forbidden");
    }

    return rubric;
}