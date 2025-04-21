"use server"
import { prisma } from "@/db/prisma"
import { decryptText } from "../utils"

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
                role: 'teacher'
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

// get Featured blogs
export async function getFeaturedBlogs(classroomId: string) {
    try {
        // Get all student Ids in classroom
        const studentIds = await prisma.classUser.findMany({
            where: {
                classId: classroomId,
                role: 'student'
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

        return featuredBlogs;
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
