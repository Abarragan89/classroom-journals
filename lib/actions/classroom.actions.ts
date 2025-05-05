'use server';
import { prisma } from "@/db/prisma";
import { classSchema } from "../validators";
import { generateClassCode } from "../utils";
import { decryptText } from "../utils";
import { ClassUserRole } from "@prisma/client";

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

        // This gets passed as the return to redirect to classroom page
        let classUrl: string = '';

        await prisma.$transaction(async (tx) => {
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
            classUrl = newClass.id
            return newClass
        })

        return { success: true, message: 'Class Created!', data: classUrl }
    } catch (error) {
        console.log('error creating classroom', error)
        return { success: false, message: 'Error creating class. Try again.' }
    }
}

// Get all Teacher Classes
export async function getAllClassrooms(teacherId: string) {
    try {
        const allClasses = await prisma.classroom.findMany({
            where: {
                users: {
                    some: {
                        userId: teacherId,
                        role: ClassUserRole.TEACHER
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })
        return allClasses
    } catch (error) {
        console.log('error creating classroom', error)
        return { success: false, message: 'Error creating class. Try again.' }
    }
}

// Get all Teacher Classes
export async function getAllClassroomIds(teacherId: string) {
    try {
        const allClasses = await prisma.classroom.findMany({
            where: {
                users: {
                    some: {
                        userId: teacherId,
                        role: ClassUserRole.TEACHER
                    }
                }
            },
            select: {
                id: true,
                name: true,
                updatedAt: true,
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })
        return allClasses
    } catch (error) {
        console.log('error creating classroom', error)
        return { success: false, message: 'Error creating class. Try again.' }
    }
}

// Get a single Classroom
export async function getSingleClassroom(classroomId: string) {
    try {
        const classroom = await prisma.classroom.findUnique({
            where: { id: classroomId }
        })
        return classroom
    } catch (error) {
        console.log('error getting single classroom', error);
        return { success: false, message: 'Error finding class. Try again.' }
    }
}

// Update Class Info
export async function updateClassInfo(prevState: unknown, formData: FormData) {
    try {
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
        await prisma.classroom.update({
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
            }
        })

        return { success: true, message: 'Class Created!' }
    } catch (error) {
        console.log('error creating classroom', error)
        return { success: false, message: 'Error creating class. Try again.' }
    }
}

// Get all Students in a classroom 
export async function getAllStudents(classId: string) {
    try {

        const allStudents = await prisma.classUser.findMany({
            where: {
                classId: classId,
                role: ClassUserRole.STUDENT
            },
            select: {
                user: {
                    select: {
                        id: true,
                        name: true, // Encrypted name
                        iv: true,
                        updatedAt: true,
                        username: true,
                        password: true,
                        commentCoolDown: true,
                    }
                }
            }
        });

        // Decrypt each student's name
        const decryptedStudents = allStudents
            .filter(studentObj => studentObj.user) // Ensure user exists
            .map(({ user }) => ({ // Destructure `user` from `studentObj`
                id: user.id,
                updatedAt: user.updatedAt,
                commentCoolDown: user.commentCoolDown,
                username: decryptText(user.username as string, user.iv as string),
                password: decryptText(user.password as string, user.iv as string),
                name: decryptText(user.name as string, user.iv as string) // Decrypt name
            }));
        return decryptedStudents
    } catch (error) {
        console.log('error deleting class', error)
        return { success: true, message: 'Error deleting class' }

    }
}

// Delete Classroom
export async function deleteClassroom(prevState: unknown, formData: FormData) {
    try {
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
        console.log('error deleting class', error)
        return { success: true, message: 'Error deleting class' }

    }
}