"use server"
import { prisma } from "@/db/prisma";
import { decryptText } from "../utils";

// This is for the students to see which requests they have made and their status
export async function getTeacherSettingData(teacherId: string, classId: string) {
    try {
        const [teacherData, studentIdsArr, classInfo] = await Promise.all([
            prisma.user.findUnique({
                where: { id: teacherId },
                select: {
                    username: true,
                    name: true,
                    iv: true,
                    email: true,
                    accountType: true,
                    id: true,
                    image: true,
                    subscriptionExpires: true,
                    subscriptionId: true,
                    isCancelling: true,
                    customerId: true,
                }
            }),

            prisma.classUser.findMany({
                where: {
                    classId: classId,
                    role: 'student',
                },
                select: {
                    userId: true,
                },
            }),

            prisma.classroom.findUnique({
                where: { id: classId },
                select: {
                    _count: {
                        select: {
                            users: true,
                        }
                    },
                    classCode: true,
                    subject: true,
                    year: true,
                    period: true,
                    name: true,
                }
            })
        ]);

        // return the teacher data with names decrypted and withouth iv string
        const teacher = {
            image: teacherData?.image,
            id: teacherData?.id,
            isCancelling: teacherData?.isCancelling,
            accountType: teacherData?.accountType,
            subscriptionExpires: teacherData?.subscriptionExpires,
            customerId: teacherData?.customerId,
            subscriptionId: teacherData?.subscriptionId,
            email: teacherData?.email,
            username: decryptText(teacherData?.username as string, teacherData?.iv as string),
            name: decryptText(teacherData?.name as string, teacherData?.iv as string),
        }

        const studentIds = studentIdsArr.map(student => student.userId)
        return { teacher, studentIds, classInfo }

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
