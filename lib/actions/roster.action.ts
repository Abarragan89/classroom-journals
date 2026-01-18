"use server";
import { prisma } from "@/db/prisma";
import { newStudentSchema } from "../validators";
import crypto from 'crypto'
import { decryptText, encryptText, generateRandom5DigitNumber } from "../utils";
import { ClassUserRole } from "@prisma/client";
import { requireAuth } from "./authorization.action";

export async function addStudentToRoster(prevState: unknown, formData: FormData) {
    try {
        const teacherId = formData.get('teacherId') as string;
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden')
        }

        const { name, username } = newStudentSchema.parse({
            name: formData.get('name'),
            username: formData.get('username')
        })

        // Get classId and StudentId
        const classId = formData.get('classId')
        if (typeof classId !== 'string') {
            throw new Error('Missing class ID');
        }

        const allStudentPasswords = await prisma.classUser.findMany({
            where: {
                classId,
                role: ClassUserRole.STUDENT
            },
            select: {
                user: {
                    select: {
                        password: true,
                        iv: true,

                    }
                }
            }
        })

        const studentPasswords = allStudentPasswords.map(classUser => {
            return decryptText(classUser.user.password as string, classUser.user.iv as string)
        })

        const password = generateRandom5DigitNumber(studentPasswords)
        const adjustedUsername = username ? username : name.split(' ')[0]

        const iv = crypto.randomBytes(16); // Generate a random IV
        const { encryptedData: encryptedName } = encryptText(name.trim(), iv);
        const { encryptedData: encryptedNickName } = encryptText(adjustedUsername.trim(), iv);
        const { encryptedData: encryptedPassword } = encryptText(password, iv)

        const newStudent = await prisma.user.create({
            data: {
                name: encryptedName,
                username: encryptedNickName,
                commentCoolDown: 20,
                iv: iv.toString('hex'),
                password: encryptedPassword,
            }
        })

        await prisma.classUser.create({
            data: {
                classId,
                userId: newStudent.id,
                role: ClassUserRole.STUDENT
            }
        })
        return { success: true, message: 'Student Successfully Added!', data: classId }

    } catch (error) {
        // Improved error logging
        if (error instanceof Error) {
            console.error('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error adding student. Try again.' }
    }
}

// Edit a student 
export async function editStudent(prevState: unknown, formData: FormData) {
    try {
        const teacherId = formData.get('teacherId') as string;
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden')
        }

        const { name, username, commentCoolDown, password } = newStudentSchema.parse({
            name: formData.get('name'),
            username: formData.get('username'),
            password: formData.get('password'),
            commentCoolDown: formData.get('comment-cool-down'),
        })

        // Get classId and StudentId
        const studentId = formData.get('studentId')
        if (typeof studentId !== 'string') {
            throw new Error('Missing classId or studentID');
        }

        // check to make sure password is not already in use
        const classId = formData.get('classId') as string
        const currentPassword = formData.get('current-password') as string

        // only do the following if they are trying to update the password  It's expensive
        if (password !== currentPassword) {
            const allStudents = await prisma.classUser.findMany({
                where: {
                    classId,
                    role: ClassUserRole.STUDENT
                },
                select: {
                    user: {
                        select: {
                            password: true,
                            iv: true
                        }
                    }
                }
            })
            const studentPasswords = allStudents.map(classUser => {
                return decryptText(classUser.user.password as string, classUser.user.iv as string)
            })
            // Password is already in use
            if (studentPasswords.includes(password as string)) {
                return { success: false, message: 'Password already in use' }
            }
        }

        const iv = crypto.randomBytes(16); // Generate a random IV
        const { encryptedData: encryptedName } = encryptText(name.trim(), iv);
        const { encryptedData: encryptedNickName } = encryptText(username?.trim() as string, iv);
        const { encryptedData: encryptedPassword } = encryptText(password?.trim() as string, iv);
        const coolDownNumber = commentCoolDown === 'disabled' ? null : Number(commentCoolDown)

        await prisma.$transaction(async (prisma) => {
            // Update the student
            await prisma.user.update({
                where: { id: studentId },
                data: {
                    name: encryptedName,
                    username: encryptedNickName,
                    commentCoolDown: coolDownNumber,
                    password: encryptedPassword,
                    iv: iv.toString('hex')
                }
            })
        })

        return { success: true, message: 'Student Successfully Updated!' }

    } catch (error) {
        if (error instanceof Error) {
            console.error('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error updating student. Try again.' }
    }
}

// delete student
export async function deleteStudent(prevState: unknown, formData: FormData) {
    try {
        const teacherId = formData.get('teacherId') as string;
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden')
        }

        // Get studentId
        const studentId = formData.get('studentId')
        if (typeof studentId !== 'string') {
            throw new Error('Missing classId or studentID');
        }

        await prisma.$transaction(async (prisma) => {
            // delete the student
            await prisma.user.delete({
                where: { id: studentId }
            })
        })
        return { success: true, message: 'Student Successfully Deleted!' }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.error('Unexpected error:', error);
        }
        return { success: false, message: 'Error deleting student. Try again.' }
    }
}