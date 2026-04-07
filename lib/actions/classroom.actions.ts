'use server';
import { prisma } from "@/db/prisma";
import { classSchema } from "../validators";
import { generateClassCode } from "../utils";
import { ClassUserRole } from "@prisma/client";
import { requireAuth } from "./authorization.action";
import { getClassUserRole, findTeacherByEmail } from "../server/classroom";

// Create a new class
export async function createNewClass(prevState: unknown, formData: FormData) {
    try {
        const { name, subject, year, period, color, grade } = classSchema.parse({
            name: formData.get('name'),
            subject: formData.get('subject'),
            year: formData.get('year'),
            period: formData.get('period'),
            color: formData.get('color'),
            grade: formData.get('grade'),
        })
        // Get Teacher Id
        const teacherId = formData.get('teacherId')
        if (typeof teacherId !== 'string') {
            throw new Error('Missing teacher ID');
        }

        const session = await requireAuth();

        if (session?.user?.id !== teacherId) {
            throw new Error("Forbidden");
        }

        const currentTeacherClassData = await prisma.user.findUnique({
            where: { id: teacherId },
            select: {
                subscriptionExpires: true,
                _count: {
                    select: {
                        classes: true,
                    }
                }
            }
        })

        const today = new Date();
        const { subscriptionExpires, _count } = currentTeacherClassData || {};
        const isSubscribed = subscriptionExpires && subscriptionExpires > today;

        let isAllowedToMakeNewClass = false;
        const classCount = _count?.classes ?? 0
        if (isSubscribed && classCount < 6) {
            isAllowedToMakeNewClass = true;
        } else if (!isSubscribed && classCount < 1) {
            isAllowedToMakeNewClass = true;
        }

        if (!isAllowedToMakeNewClass) {
            throw new Error('You have reached your class limit')
        }


        // Get all classcodes to ensure no duplicates
        const allClassCodes = await prisma.classroom.findMany({
            where: {},
            select: { classCode: true }
        })

        const classCodes = allClassCodes.map(classroom => classroom.classCode)
        const classCode = generateClassCode(classCodes);

        // Execute transaction and return the new class
        const newClassData = await prisma.$transaction(async (tx) => {
            const newClass = await tx.classroom.create({
                data: {
                    name: name.trim(),
                    subject: subject?.trim(),
                    year: year?.trim(),
                    period: period?.trim(),
                    color,
                    classCode,
                    grade
                }
            })
            await tx.classUser.create({
                data: {
                    userId: teacherId,
                    classId: newClass.id,
                    role: ClassUserRole.TEACHER
                }
            })
            return newClass;
        })

        // Return full class object with _count for cache update
        return {
            success: true,
            message: 'Class Created!',
            data: {
                id: newClassData.id,
                name: newClassData.name,
                subject: newClassData.subject,
                year: newClassData.year,
                period: newClassData.period,
                color: newClassData.color,
                grade: newClassData.grade,
                classCode: newClassData.classCode,
                createdAt: newClassData.createdAt,
                updatedAt: newClassData.updatedAt,
                _count: { users: 1 } // Teacher is the first user
            }
        }
    } catch (error) {
        console.error('error creating classroom', error)
        return { success: false, message: 'Error creating class. Try again.' }
    }
}

// Update Class Info
export async function updateClassInfo(prevState: unknown, formData: FormData) {
    try {
        await requireAuth();
        const { name, subject, year, period, color, grade } = classSchema.parse({
            name: formData.get('name'),
            subject: formData.get('subject'),
            year: formData.get('year'),
            period: formData.get('period'),
            color: formData.get('color'),
            grade: formData.get('grade')
        })
        // Get classroom Id
        const classroomId = formData.get('classroomId')
        if (typeof classroomId !== 'string') {
            throw new Error('Missing classroom ID');
        }

        const updatedClass = await prisma.classroom.update({
            where: {
                id: classroomId
            },
            data: {
                name: name.trim(),
                subject: subject?.trim(),
                year: year?.trim(),
                period: period?.trim(),
                color,
                grade
            },
            select: {
                id: true,
                name: true,
                subject: true,
                year: true,
                period: true,
                color: true,
                grade: true,
                classCode: true,
                createdAt: true,
                updatedAt: true,
            }
        })

        return { success: true, message: 'Class Updated!', data: updatedClass }
    } catch (error) {
        console.error('error updating classroom', error)
        return { success: false, message: 'Error updating class. Try again.' }
    }
}


// Delete Classroom
export async function deleteClassroom(prevState: unknown, formData: FormData) {
    try {
        const teacherId = formData.get('teacherId') as string
        const session = await requireAuth();

        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden')
        }

        const classroomId = formData.get('classroomId') as string

        const studentUsers = await prisma.classUser.findMany({
            where: {
                classId: classroomId,
                role: ClassUserRole.STUDENT,
            },
            select: { userId: true }, // Get only user IDs
        });

        const studentUserIds = studentUsers.map((student) => student.userId);

        if (studentUserIds.length > 0) {
            await prisma.user.deleteMany({
                where: {
                    id: { in: studentUserIds }, // Delete all student users
                },
            });
        }

        await prisma.classroom.delete({
            where: {
                id: classroomId
            }
        })

        return { success: true, message: 'Class Delete' }

    } catch (error) {
        console.error('error deleting class', error)
        return { success: true, message: 'Error deleting class' }

    }
}

// Look up a teacher by email for the co-teacher search flow
export async function findTeacherByEmailAction(classId: string, email: string) {
    try {
        const session = await requireAuth();
        const sessionUserId = session.user.id as string;

        const sessionUserRole = await getClassUserRole(classId, sessionUserId);
        if (sessionUserRole !== ClassUserRole.TEACHER) {
            throw new Error('Forbidden');
        }

        const user = await findTeacherByEmail(email);
        if (!user || !user.id) {
            return { success: false, message: 'No teacher account found with that email.' };
        }

        if (user.id === sessionUserId) {
            return { success: false, message: 'You cannot add yourself as a co-teacher.' };
        }

        const existingRole = await getClassUserRole(classId, user.id);
        if (existingRole) {
            return { success: false, message: 'This teacher is already in this class.' };
        }

        return { success: true, data: { id: user.id, name: user.name ?? null, username: user.username ?? null, email: user.email ?? null } };
    } catch (error) {
        console.error('error finding teacher', error);
        return { success: false, message: 'Error looking up teacher. Try again.' };
    }
}

// Add a co-teacher to a class by email
export async function addCoTeacher(classId: string, email: string) {
    try {
        const session = await requireAuth();
        const sessionUserId = session.user.id as string;

        // Only the class TEACHER (owner) can add co-teachers
        const sessionUserRole = await getClassUserRole(classId, sessionUserId);
        if (sessionUserRole !== ClassUserRole.TEACHER) {
            throw new Error('Forbidden');
        }

        const userToAdd = await findTeacherByEmail(email);
        if (!userToAdd.id) {
            return { success: false, message: 'No teacher account found with that email.' };
        }

        if (userToAdd.id === sessionUserId) {
            return { success: false, message: 'You cannot add yourself as a co-teacher.' };
        }

        const existingRole = await getClassUserRole(classId, userToAdd.id);
        if (existingRole) {
            return { success: false, message: 'This teacher is already in this class.' };
        }

        await prisma.classUser.create({
            data: { userId: userToAdd.id, classId, role: ClassUserRole.CO_TEACHER }
        });

        return { success: true, message: 'Co-teacher added!', data: userToAdd };
    } catch (error) {
        console.error('error adding co-teacher', error);
        return { success: false, message: 'Error adding co-teacher. Try again.' };
    }
}

// Remove a co-teacher from a class (owner or self-removal only)
export async function removeCoTeacher(classId: string, coTeacherId: string) {
    try {
        const session = await requireAuth();
        const sessionUserId = session.user.id as string;

        const sessionUserRole = await getClassUserRole(classId, sessionUserId);
        const isSelfRemoval = sessionUserId === coTeacherId;

        if (!isSelfRemoval && sessionUserRole !== ClassUserRole.TEACHER) {
            throw new Error('Forbidden');
        }

        await prisma.classUser.delete({
            where: { userId_classId: { userId: coTeacherId, classId } }
        });

        return { success: true, selfRemoval: isSelfRemoval };
    } catch (error) {
        console.error('error removing co-teacher', error);
        return { success: false, message: 'Error removing co-teacher. Try again.' };
    }
}