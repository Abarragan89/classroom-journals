"use server";
import { prisma } from "@/db/prisma";
import { newStudentSchema } from "../validators";
import crypto from 'crypto'
import { encryptText, generateRandom5DigitNumber } from "../utils";

export async function addStudentToRoster(prevState: unknown, formData: FormData) {
    try {
        const { name, username } = newStudentSchema.parse({
            name: formData.get('name'),
            username: formData.get('username')
        })

        // Get Teacher Id
        const classId = formData.get('classId')
        if (typeof classId !== 'string') {
            throw new Error('Missing teacher ID');
        }

        const allStudentPasswords = await prisma.classUser.findMany({
            where: {
                classId,
                role: 'student'
            },
            include: {
                user: {
                    select: { password: true }
                }
            }
        })

        const studentPasswords = allStudentPasswords.map(classroom => classroom.user?.password ? classroom.user.password : '')
        const password = generateRandom5DigitNumber(studentPasswords)
        const adjustedUsername = username ? username : name.split(' ')[0]

        const iv = crypto.randomBytes(16); // Generate a random IV
        const { encryptedData: encryptedName } = encryptText(name, iv);
        const { encryptedData: encryptedNickName } = encryptText(adjustedUsername, iv);


        const newStudent = await prisma.user.create({
            data: {
                name: encryptedName,
                username: encryptedNickName,
                iv: iv.toString('hex'),
                password
            }
        })

        await prisma.classUser.create({
            data: {
                classId,
                userId: newStudent.id,
                role: 'student'
            }
        })
        return { success: true, message: 'Student Successfully Added!', data: classId }

    } catch (error) {
        // Improved error logging
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }
        return { success: false, message: 'Error creating prompt. Try again.' }
    }
}