'use server';
import { prisma } from "@/db/prisma";
import { classSchema } from "../validators";

// Create a new class
export async function createNewClass(prevState: unknown, formData: FormData) {
    try {
        const { name, subject, year, period, color } = classSchema.parse({
            name: formData.get('name'),
            subject: formData.get('subject'),
            year: formData.get('year'),
            period: formData.get('period'),
            color: formData.get('color')
        })
        // Get Teacher Id
        const teacherId = formData.get('teacherId')
        if (typeof teacherId !== 'string') {
            throw new Error('Missing teacher ID');
        }

        await prisma.$transaction(async (tx) => {
            const newClass = await tx.class.create({
                data: {
                    name,
                    subject,
                    year,
                    period,
                    color
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

// Get all Teacher Classes (Dashboard)
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
        })
        return allClasses
    } catch (error) {
        console.log('error creating classroom', error)
        return { success: false, message: 'Error creating class. Try again.' }
        return []
    }
}