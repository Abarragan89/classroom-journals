'use server';
import { prisma } from "@/db/prisma";
import { classSchema } from "../validators";
import { generateClassCode } from "../utils";

// Create a new class
export async function createNewClass(prevState: unknown, formData: FormData) {
    try {
        const { name, subject, year, period, color } = classSchema.parse({
            name: formData.get('name'),
            subject: formData.get('subject'),
            year: formData.get('year'),
            period: formData.get('period'),
            color: formData.get('color'),
        })
        // Get Teacher Id
        const teacherId = formData.get('teacherId')
        if (typeof teacherId !== 'string') {
            throw new Error('Missing teacher ID');
        }
        const classCode = generateClassCode();

        await prisma.$transaction(async (tx) => {
            const newClass = await tx.class.create({
                data: {
                    name: name.trim(),
                    subject: subject?.trim(),
                    year: year?.trim(),
                    period: period?.trim(),
                    color,
                    classCode
                }
            })
            await tx.classUser.create({
                data: {
                    userId: teacherId,
                    classId: newClass.id,
                    role: "teacher"
                }
            })
            return newClass
        })

        return { success: true, message: 'Class Created!' }
    } catch (error) {
        console.log('error creating classroom', error)
        return { success: false, message: 'Error creating class. Try again.' }
    }
}

// Get all Teacher Classes
export async function getAllClassrooms(teacherId: string) {
    try {
        const allClasses = await prisma.class.findMany({
            where: {
                users: {
                    some: {
                        userId: teacherId,
                        role: 'teacher'
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
        const allClasses = await prisma.class.findMany({
            where: {
                users: {
                    some: {
                        userId: teacherId,
                        role: 'teacher'
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
        const classroom = await prisma.class.findUnique({
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
        const { name, subject, year, period, color } = classSchema.parse({
            name: formData.get('name'),
            subject: formData.get('subject'),
            year: formData.get('year'),
            period: formData.get('period'),
            color: formData.get('color')
        })
        // Get classroom Id
        const classroomId = formData.get('classroomId')
        if (typeof classroomId !== 'string') {
            throw new Error('Missing classroom ID');
        }
        await prisma.class.update({
            where: {
                id: classroomId
            },
            data: {
                name: name.trim(),
                subject: subject?.trim(),
                year: year?.trim(),
                period: period?.trim(),
                color
            }
        })

        return { success: true, message: 'Class Created!' }
    } catch (error) {
        console.log('error creating classroom', error)
        return { success: false, message: 'Error creating class. Try again.' }
    }
}

// Delete Classroom
export async function deleteClassroom(prevState: unknown, formData: FormData) {
    try {

        const classroomId = formData.get('classroomId') as string
        await prisma.class.delete({
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