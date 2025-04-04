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

        // Get classId and StudentId
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
        const { encryptedData: encryptedName } = encryptText(name.trim(), iv);
        const { encryptedData: encryptedNickName } = encryptText(adjustedUsername.trim(), iv);


        const newStudent = await prisma.user.create({
            data: {
                name: encryptedName,
                username: encryptedNickName,
                commentCoolDown: 20,
                iv: iv.toString('hex'),
                password,
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
            // console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }
        return { success: false, message: 'Error adding student. Try again.' }
    }
}

// Edit a student 
export async function editStudent(prevState: unknown, formData: FormData) {
    try {

        const { name, username, commentCoolDown, password } = newStudentSchema.parse({
            name: formData.get('name'),
            username: formData.get('username'),
            password: formData.get('password'),
            commentCoolDown: formData.get('comment-cool-down'),
        })


        // check to make sure password is not already in use
        const classId = formData.get('classId') as string
        const currentPassword = formData.get('current-password') as string
        // only do the following if they are trying to update the password
        if (password !== currentPassword) {
            const allStudents = await prisma.classUser.findMany({
                where: {
                    classId,
                    role: 'student'
                },
                select: {
                    user: {
                        select: {
                            password: true
                        }
                    }
                }
            })
            const allStudentPasswords = allStudents.map(user => user.user.password)
            // Password is already in use
            if (allStudentPasswords.includes(password as string)) {
                return { success: false, message: 'Password already in use' }
            }
        }

        // Get classId and StudentId
        const studentId = formData.get('studentId')
        if (typeof studentId !== 'string') {
            throw new Error('Missing classId or studentID');
        }

        const iv = crypto.randomBytes(16); // Generate a random IV
        const { encryptedData: encryptedName } = encryptText(name.trim(), iv);
        const { encryptedData: encryptedNickName } = encryptText(username?.trim() as string, iv);
        const coolDownNumber = commentCoolDown === 'disabled' ? null : Number(commentCoolDown)

        await prisma.$transaction(async (prisma) => {
            // delete the student
            await prisma.user.update({
                where: { id: studentId },
                data: {
                    name: encryptedName,
                    username: encryptedNickName,
                    commentCoolDown: coolDownNumber,
                    password: password,
                    iv: iv.toString('hex')
                }
            })
        })

        return { success: true, message: 'Student Successfully Updated!' }

    } catch (error) {
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }
        return { success: false, message: 'Error updating student. Try again.' }
    }
}

// delete student
export async function deleteStudent(prevState: unknown, formData: FormData) {
    try {
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
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }
        return { success: false, message: 'Error deleting student. Try again.' }
    }
}

export async function getStudentCountByClassId(classId: string) {
    try {
        if (typeof classId !== 'string') {
            throw new Error('Missing or invalid classId');
        }

        const studentCount = await prisma.classUser.count({
            where: {
                classId,
                role: 'student'
            }
        });

        return { success: true, count: studentCount };
    } catch (error) {
        if (error instanceof Error) {
            console.log('Error fetching student count:', error.message);
        } else {
            console.log('Unexpected error:', error);
        }
        return { success: false, count: 0 };
    }
}