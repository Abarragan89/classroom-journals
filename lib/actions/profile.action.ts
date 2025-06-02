"use server"
import { prisma } from "@/db/prisma";
import { decryptText, encryptText } from "../utils";
import { ClassUserRole, TeacherAccountType } from "@prisma/client";
import { requireAuth } from "./authorization.action";

// This is for the students to see which requests they have made and their status
export async function getTeacherSettingData(teacherId: string, classId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden');
        }
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
                    role: ClassUserRole.STUDENT
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
                    grade: true
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
        await requireAuth();
        // get teacher data to determine subscription status
        const teacherInfo = await prisma.user.findUnique({
            where: { id: teacherId },
            select: {
                subscriptionExpires: true,
                accountType: true,
                _count: {
                    select: {
                        classes: true,
                    }
                }
            }
        })

        // Determine if subscription is expired or not to render correc tUI
        const today = new Date();
        const isSubscriptionActive = teacherInfo?.subscriptionExpires ? teacherInfo?.subscriptionExpires > today : false;
        const totalClasses = teacherInfo?._count.classes;
        const isPremiumTeacher = isSubscriptionActive && teacherInfo?.accountType === TeacherAccountType.PREMIUM
        const isAllowedToMakeNewClass = isSubscriptionActive && (totalClasses ?? 0) < 6 || (totalClasses ?? 0) < 1;

        return { isSubscriptionActive, isAllowedToMakeNewClass, isPremiumTeacher }
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

// update a teacher's username
export async function updateUsername(username: string, teacherId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden');
        }
        // get the iv to update the name
        const teacher = await prisma.user.findUnique({
            where: { id: teacherId },
            select: {
                iv: true,
            }
        })

        // make the buffer out of the iv string
        const ivBuffer = Buffer.from(teacher?.iv as string, 'hex');
        const { encryptedData } = encryptText(username, ivBuffer);

        // update the user with the encrypted name
        await prisma.user.update({
            where: { id: teacherId },
            data: {
                username: encryptedData
            }
        })


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


export async function getTeacherAccountData(teacherId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden');
        }
        const teacherData = await prisma.user.findUnique({
            where: { id: teacherId },
            select: {
                username: true,
                name: true,
                iv: true,
                email: true,
                accountType: true,
                avatarURL: true,
                id: true,
                image: true,
                subscriptionExpires: true,
                subscriptionId: true,
                isCancelling: true,
                customerId: true,
            }
        })

        const decryptedTeacher = {
            image: teacherData?.image,
            id: teacherData?.id,
            isCancelling: teacherData?.isCancelling,
            avatarURL: teacherData?.avatarURL,
            accountType: teacherData?.accountType,
            subscriptionExpires: teacherData?.subscriptionExpires,
            customerId: teacherData?.customerId,
            subscriptionId: teacherData?.subscriptionId,
            email: teacherData?.email,
            username: decryptText(teacherData?.username as string, teacherData?.iv as string),
            name: decryptText(teacherData?.name as string, teacherData?.iv as string),
        }

        return decryptedTeacher
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
export async function deleteTeacherAccount(teacherId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden');
        }
        // 1. Find all classes the teacher owns
        const teacherClasses = await prisma.classUser.findMany({
            where: {
                userId: teacherId,
                role: ClassUserRole.TEACHER
            },
            select: {
                classId: true,
            },
        });
        const classIds = teacherClasses.map((c) => c.classId);

        if (classIds.length > 0) {
            // 2. Get all the student Ids
            const studentClassUsers = await prisma.classUser.findMany({
                where: {
                    classId: { in: classIds },
                    role: ClassUserRole.STUDENT
                },
                select: {
                    userId: true,
                },
            });
            const studentIds = studentClassUsers.map(cu => cu.userId);

            // 3. Delete student users
            await prisma.user.deleteMany({
                where: {
                    id: { in: studentIds },
                },
            });

            // 4. Delete all ClassUser entries for those classes (removes students and teachers from the classes)
            await prisma.classUser.deleteMany({
                where: {
                    classId: { in: classIds },
                },
            });


            // 5. Delete the classrooms
            await prisma.classroom.deleteMany({
                where: {
                    id: { in: classIds },
                },
            });
        }

        // 6. Delete the teacher account
        await prisma.user.delete({
            where: { id: teacherId },
        });

        return { success: true, message: 'successfully deleted account' }
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

// Update user Avatar
// update a teacher's username
export async function updateUserAvatar(avatarURL: string, userId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== userId) {
            throw new Error('Forbidden');
        }
        // get the iv to update the name
        await prisma.user.update({
            where: { id: userId },
            data: {
                avatarURL: avatarURL,
            }
        })

    } catch (error) {
        // Improved error logging
        if (error instanceof Error) {
            console.log('error updating avatar:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }
        return { success: false, message: 'Error updating avatar. Try again.' }
    }
}

export async function getUserAvatarURL(userId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== userId) {
            throw new Error('Forbidden');
        }
        // get the iv to update the name
        const userInfo = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                avatarURL: true,
            }
        })

        return userInfo?.avatarURL

    } catch (error) {
        // Improved error logging
        if (error instanceof Error) {
            console.log('error updating avatar:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }
        return { success: false, message: 'Error updating avatar. Try again.' }
    }
}


