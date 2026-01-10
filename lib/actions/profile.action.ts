"use server"
import { prisma } from "@/db/prisma";
import { encryptText } from "../utils";
import { ClassUserRole } from "@prisma/client";
import { requireAuth } from "./authorization.action";

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

        return { success: true, message: 'Avatar updated successfully', avatarURL };

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


