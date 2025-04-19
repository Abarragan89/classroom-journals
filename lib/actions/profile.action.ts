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
                    id: true,
                    classCode: true,
                    subject: true,
                    year: true,
                    period: true,
                    name: true,
                    color: true,
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


// Determine subscription allowance for adding prompts and classes
export async function determineSubscriptionAllowance(teacherId: string) {
    try {
        // get teacher data to determine subscription status
        const teacherInfo = await prisma.user.findUnique({
            where: { id: teacherId },
            select: {
                subscriptionExpires: true,
                _count: {
                    select: {
                        prompts: true,
                        classes: true,
                    }
                }
            }
        })

        // Determine if subscription is expired or not to render correc tUI
        const today = new Date();
        const isSubscriptionActive = teacherInfo?.subscriptionExpires ? teacherInfo?.subscriptionExpires > today : false;
        const totalPrompts = teacherInfo?._count.prompts;
        const totalClasses = teacherInfo?._count.classes;

        const isAllowedToMakePrompt = isSubscriptionActive || (totalPrompts ?? 0) < 15;

        const isAllowedToMakeNewClass = isSubscriptionActive && (totalClasses ?? 0) < 6 || (totalClasses ?? 0) < 1;

        return { isAllowedToMakeNewClass, isAllowedToMakePrompt }
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