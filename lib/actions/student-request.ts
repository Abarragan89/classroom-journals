"use server"
import { prisma } from "@/db/prisma"
import { decryptText, encryptText } from "../utils"
import { Question } from "@/types"
import { Prisma, PromptType, StudentRequestStatus, StudentRequestType } from "@prisma/client"
import { requireAuth } from "./authorization.action"

export async function createStudentRequest(studentId: string, teacherId: string, text: string, type: string, classId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== studentId) {
            throw new Error("Forbidden");
        }
        // get student iv to encrypt the text
        let userText: string = ''
        if (type === 'USERNAME') {
            // get student Iv to encrpyt the potential username
            const studentIv = await prisma.user.findUnique({
                where: { id: studentId },
                select: { iv: true }
            })
            if (studentIv?.iv) {
                // Convert the iv from string, to arraybuffer
                const ivBuffer = Buffer.from(studentIv.iv, 'hex');
                // Step 2: Encrypt the username using the IV
                const { encryptedData: encryptedUsername } = encryptText(text.trim(), ivBuffer);
                userText = encryptedUsername
            }
        } else {
            userText = text
        }

        await prisma.studentRequest.create({
            data: {
                studentId,
                teacherId,
                classId,
                text: userText,
                type: type === 'USERNAME' ? StudentRequestType.USERNAME : StudentRequestType.PROMPT,
                status: StudentRequestStatus.PENDING
            }
        })

        return { success: true, message: 'Request has been made' }
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

// This is for the students to see which requests they have made and their status
export async function markAllRequestsAsViewed(teacherId: string, classId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error("Forbidden");
        }
        const count = await prisma.studentRequest.updateMany({
            where: { teacherId, classId },
            data: {
                status: StudentRequestStatus.VIEWED
            }
        });
        return count
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
export async function approveUsernameChange(studentId: string, username: string, responseId: string, teacherId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error("Forbidden");
        }
        // Update the user with the new encrypted username
        await prisma.user.update({
            where: { id: studentId },
            data: {
                username: username,
            },
        });

        // change the status of the request
        // await prisma.studentRequest.update({
        //     where: { id: responseId },
        //     data: {
        //         status: 'approved'
        //     }
        // })

        // delete request once approved
        await prisma.studentRequest.delete({
            where: { id: responseId }
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
export async function approveNewPrompt(teacherId: string, requestText: string, responseId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error("Forbidden");
        }
        // build up the questions for the prompt Session
        const questions: Question[] = [];
        // user only provides the initial question
        questions.push({ question: requestText });
        questions.push({ question: 'Add a Blog Title' })
        questions.push({ question: 'Add a Cover Photo' })


        await prisma.$transaction(async (prisma) => {
            await prisma.prompt.create({
                data: {
                    title: requestText.trim(),
                    teacherId,
                    promptType: PromptType.BLOG,
                    questions: questions as unknown as Prisma.InputJsonValue,
                },
            });

            // change the status of the request
            // await prisma.studentRequest.update({
            //     where: { id: responseId },
            //     data: {
            //         status: 'approved'
            //     }
            // })

            // delete request once approved
            await prisma.studentRequest.delete({
                where: { id: responseId }
            })
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
export async function declineStudentRequest(responseId: string, teacherId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error("Forbidden");
        }
        // change the status of the request
        // await prisma.studentRequest.update({
        //     where: { id: responseId },
        //     data: {
        //         status: 'denied'
        //     }
        // })

        // delete request once approved
        await prisma.studentRequest.delete({
            where: { id: responseId }
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