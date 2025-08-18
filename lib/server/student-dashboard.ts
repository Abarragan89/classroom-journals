import { prisma } from "@/db/prisma"
import { requireAuth } from "@/lib/actions/authorization.action"
import { ClassUserRole, ResponseStatus } from "@prisma/client"
import { decryptText } from "../utils"
import { ResponseData } from "@/types"

export async function getStudentName(studentId: string) {
    if (!studentId) {
        throw new Error("Missing studentId")
    }

    const session = await requireAuth()
    if (session?.user?.id !== studentId) {
        throw new Error("Forbidden")
    }

    const student = await prisma.user.findUnique({
        where: {
            id: studentId,
        },
        select: {
            username: true,
            iv: true
        },
    })

    if (!student) {
        throw new Error("Student not found")
    }

    const decodedName = decryptText(student.username as string, student.iv as string);
    return decodedName;
}

export async function getAllPromptCategories(userId: string) {
    const session = await requireAuth();

    if (!session?.user?.id) {
        throw new Error("Forbidden");
    }

    return prisma.promptCategory.findMany({
        where: { userId },
        select: { id: true, name: true },
    });
}

// Get classroom Grade for AI
export async function getClassroomGrade(classroomId: string) {
    const session = await requireAuth();
    if (session?.classroomId !== classroomId) {
        throw new Error("Forbidden");
    }

    const classroom = await prisma.classroom.findUnique({
        where: { id: classroomId },
        select: {
            grade: true
        }
    });

    if (!classroom) {
        throw new Error("Classroom not found");
    }

    return classroom.grade;
}

// Get featured blogs
export async function getFeaturedBlogs(classroomId: string) {
    const session = await requireAuth();
    if (session?.classroomId !== classroomId) {
        throw new Error("Forbidden");
    }

    // Get all student IDs in classroom
    const studentIds = await prisma.classUser.findMany({
        where: {
            classId: classroomId,
            role: ClassUserRole.STUDENT
        },
        select: {
            userId: true
        }
    });

    const studentIdArray = studentIds.map(student => student.userId);

    // Get Featured Blogs
    const featuredBlogs = await prisma.response.findMany({
        where: {
            studentId: { in: studentIdArray },
            completionStatus: ResponseStatus.COMPLETE,
            promptSession: {
                isPublic: true,
            },
        },
        select: {
            id: true,
            promptSession: {
                select: {
                    id: true
                }
            },
            studentId: true,
            response: true,
            submittedAt: true,
            likeCount: true,
            _count: {
                select: {
                    comments: true
                }
            },
            student: {
                select: {
                    iv: true,
                    username: true
                }
            }
        },
        orderBy: {
            likeCount: 'desc'
        },
        take: 10,
    });

    const today = new Date();
    const decryptedBlogNames = featuredBlogs
        .map((blog) => {
            const responseData = blog?.response as unknown as ResponseData[];
            const answer = responseData?.[0]?.answer || "";
            const characterCount = answer.length;

            // Exclude very short blogs
            if (characterCount < 250) return null;

            // Convert submittedAt to Date
            const submittedAtDate = new Date(blog.submittedAt as Date);
            const daysAgo = (today.getTime() - submittedAtDate.getTime()) / (1000 * 60 * 60 * 24);

            // Get interaction counts
            const totalLikes = blog?.likeCount || 0;
            const totalComments = blog?._count?.comments || 0;

            // Priority score: weight likes, comments, and recency
            const priorityScore = totalLikes * 2 + totalComments * 1.5 - daysAgo;

            return {
                ...blog,
                student: {
                    username: decryptText(blog.student.username as string, blog.student.iv as string),
                },
                priorityScore,
            };
        })
        .filter(Boolean)
        .sort((a, b) => b!.priorityScore - a!.priorityScore);

    return decryptedBlogNames;
}


// Get student Requests
export async function getStudentRequests(studentId: string) {
    const session = await requireAuth();
    
    if (session?.user?.id !== studentId) {
        throw new Error("Forbidden");
    }

    const studentRequests = await prisma.studentRequest.findMany({
        where: { studentId }
    });

    return studentRequests;
}
