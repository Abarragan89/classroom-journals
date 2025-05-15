"use server"
import { prisma } from "@/db/prisma"
import { decryptText } from "../utils"
import { ResponseData } from "@/types"
import { ClassUserRole, ResponseStatus } from "@prisma/client"

// Get and decrypt student username 
export async function getDecyptedStudentUsername(studentId: string) {
    try {
        // get student username
        const studentInfo = await prisma.user.findUnique({
            where: { id: studentId },
            select: {
                username: true,
                iv: true,
            }
        })
        return decryptText(studentInfo?.username as string, studentInfo?.iv as string)
    } catch (error) {
        console.log('error ', error)
        // Improved error logging
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }
        return { success: false, message: 'Error adding student. Try again.' }
    }
}

// Get teacherId form classroomId
export async function getTeacherId(classroomId: string) {
    try {
        const { userId: teacherId } = await prisma.classUser.findFirst({
            where: {
                classId: classroomId,
                role: ClassUserRole.TEACHER
            },
            select: {
                userId: true
            }
        }) as { userId: string }
        return teacherId
    } catch (error) {
        console.log('error ', error)
        // Improved error logging
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }
        return { success: false, message: 'Error adding student. Try again.' }
    }
}

// Get classroom Grade for AI
export async function getClassroomGrade(classroomId: string) {
    try {
        const { grade } = await prisma.classroom.findUnique({
            where: { id: classroomId },
            select: {
                grade: true
            }
        }) as { grade: string }
        return grade
    } catch (error) {
        console.log('error ', error)
        // Improved error logging
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }
        return { success: false, message: 'Error adding student. Try again.' }
    }
}

// get Featured blogs
export async function getFeaturedBlogs(classroomId: string) {
    try {
        // Get all student Ids in classroom
        const studentIds = await prisma.classUser.findMany({
            where: {
                classId: classroomId,
                role: ClassUserRole.STUDENT
            },
            select: {
                userId: true
            }
        })
        const studentIdArray = studentIds.map(student => student.userId)

        // Get Featured Blog 
        const featuredBlogs = await prisma.response.findMany({
            where: {
                studentId: { in: studentIdArray },
                completionStatus: ResponseStatus.COMPLETE,
                promptSession: {
                    isPublic: true, // ✅ Filter by public prompt sessions
                },
                // likeCount: { gt: 2 }
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
        })
        const today = new Date();
        const decryptedBlogNames = featuredBlogs
            .map((blog) => {
                const responseData = blog?.response as unknown as ResponseData[];
                const answer = responseData?.[0]?.answer || "";
                const characterCount = answer.length;

                // Exclude very short blogs
                if (characterCount < 250) return;

                // Convert submittedAt to Date
                const submittedAtDate = new Date(blog.submittedAt as Date);
                const daysAgo = (today.getTime() - submittedAtDate.getTime()) / (1000 * 60 * 60 * 24); // days since submission

                // Get interaction counts
                const totalLikes = blog?.likeCount || 0;
                const totalComments = blog?._count?.comments || 0;

                // Example priority score: weight likes, comments, and recency
                const priorityScore = totalLikes * 2 + totalComments * 1.5 - daysAgo;

                return {
                    ...blog,
                    student: {
                        username: decryptText(blog.student.username as string, blog.student.iv as string),
                    },
                    priorityScore,
                };
            })
            .filter(Boolean) // remove nulls
            .sort((a, b) => b!.priorityScore - a!.priorityScore); // descending


        return decryptedBlogNames;
    } catch (error) {
        console.log('error ', error)
        // Improved error logging
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }
        return { success: false, message: 'Error adding student. Try again.' }
    }
}


// Get student Requests
export async function getStudentRequests(studentId: string) {
    try {
        // get student username
        const studentRequests = await prisma.studentRequest.findMany({
            where: { studentId }
        })
        return studentRequests
    } catch (error) {
        console.log('error ', error)
        // Improved error logging
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }
        return { success: false, message: 'Error adding student. Try again.' }
    }
}