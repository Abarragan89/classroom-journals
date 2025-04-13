"use server"
import { prisma } from "@/db/prisma"
import { decryptText, encryptText } from "../utils"

export async function createStudentRequest(studentId: string, teacherId: string, text: string, type: string) {
    try {
        await prisma.studentRequest.create({
            data: {
                studentId,
                teacherId,
                text,
                type,
                status: 'pending'
            }
        })
        return { success: true, message: 'Error adding student. Try again.' }
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

// These requests are for the teacher to see
export async function getTeacherRequests(teacherId: string) {
    try {
        const teacherRequests = await prisma.studentRequest.findMany({
            where: {
                teacherId,
                status: 'pending'
            },
            include: {
                student: {
                    select: {
                        username: true,
                        iv: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const decyptedTeacherRequests = teacherRequests.map((studentRequest) => ({
            ...studentRequest,
            student: {
                username: decryptText(studentRequest.student.username as string, studentRequest.student.iv as string),
                id: true,
            }
        }))

        return decyptedTeacherRequests;
    } catch (error) {
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

// This is for the students to see which requests they have made and their status
export async function getStudentRequests(studentId: string) {
    try {
        const studentRequests = await prisma.studentRequest.findMany({
            where: { studentId },
        });
        return studentRequests
    } catch (error) {
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

// This is for the students to see which requests they have made and their status
export async function approveUsernameChange(studentId: string, username: string, responseId: string) {
    try {
        // Step 1: Fetch the existing user record to get the `iv`
        const existingUser = await prisma.user.findUnique({
            where: { id: studentId },
            select: { iv: true },
        });

        if (!existingUser || !existingUser.iv) {
            throw new Error("User not found or missing IV for encryption.");
        }

        // Convert the iv from string, to arraybuffer
        const ivBuffer = Buffer.from(existingUser.iv, 'hex');

        // Step 2: Encrypt the username using the IV
        const { encryptedData: encryptedUsername } = encryptText(username.trim(), ivBuffer);

        // Step 3: Update the user with the new encrypted username
        await prisma.user.update({
            where: { id: studentId },
            data: {
                username: encryptedUsername,
            },
        });

        // change the status of the request
        await prisma.studentRequest.update({
            where: { id: responseId },
            data: {
                status: 'approved'
            }
        })

        return { success: true, message: 'Error adding student. Try again.' }
    } catch (error) {
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

// This is for the students to see which requests they have made and their status
export async function declineUsernameChange(responseId: string) {
    try {
        // change the status of the request
        await prisma.studentRequest.update({
            where: { id: responseId },
            data: {
                status: 'denied'
            }
        })
        return { success: true, message: 'Error adding student. Try again.' }
    } catch (error) {
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