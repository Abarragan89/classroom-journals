"use server"
import { GoogleClassroom, User } from "@/types";
import { getValidAccessToken } from "./refresh.token.action";
import { prisma } from "@/db/prisma";
import { generateClassCode } from "../utils";
import { GoogleProfile } from "next-auth/providers/google";


// Get all Active google classroom classes that teacher is owner
export async function getTeacherGoogleClassrooms(googleProviderId: string) {
    const accessToken = await getValidAccessToken()
    try {
        const res = await fetch(
            `https://classroom.googleapis.com/v1/courses`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        const data = await res.json();
        const currentClassrooms = data?.courses?.filter((currentClass: GoogleClassroom) => currentClass.courseState === 'ACTIVE' && currentClass.ownerId === googleProviderId)
        return currentClassrooms || [];

    } catch (error) {
        if (error instanceof Error) {
            console.log("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }

        return { success: false, message: "Error fetching prompts. Try again." };
    }
}

// create class with google classroom roster
export async function createClassroomWithGoogle(classroom: GoogleClassroom, teacherId: string) {

    try {
        const accessToken = await getValidAccessToken()
        const res = await fetch(
            `https://classroom.googleapis.com/v1/courses/${classroom.id}/students`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        if (!res.ok) {
            throw new Error(`Error fetching classrooms: ${res.statusText}`);
        }
        const studentdata = await res.json();
        const classCode = generateClassCode();

        let classroomId: string = '';
        await prisma.$transaction(async (prisma) => {
            const newClassroom = await prisma.classroom.create({
                data: {
                    name: classroom.name,
                    classCode: classCode,
                    color: '#dc2626',
                    subject: classroom?.section || 'N/A',
                    year: classroom?.creationTime?.split('-')[0] || 'N/A'
                }
            })

            // Create Teacher association
            await prisma.classUser.create({
                data: {
                    userId: teacherId,
                    classId: newClassroom.id,
                    role: 'teacher'
                }
            })

            // If there are students in the roster, add them to the calss
            if (studentdata?.students?.length > 0) {

                const studentsToAdd = studentdata?.students?.map((student: GoogleProfile) => ({
                    googleId: student.profile.id, // this will just be there googleId, actual ID is autogenerated
                    name: student.profile.name.fullName,

                }));

                const addedStudents = await Promise.all(
                    studentsToAdd.map((student: User) =>
                        prisma.user.upsert({
                            where: { googleId: student.googleId }, // Ensure uniqueness using email
                            update: {}, // If the student exists, do nothing
                            create: student, // Otherwise, create the student
                        })
                    )
                );

                // Generate the associations with students and classroom
                const classUserAssociations = addedStudents?.map((student: User) => ({
                    userId: student.id, // Use the `userId` returned from the user table
                    classId: newClassroom.id,
                    role: 'student',
                }));


                // Make Classroom associations
                await prisma.classUser.createMany({
                    data: classUserAssociations,
                    skipDuplicates: true
                })
            }
            classroomId = newClassroom.id
            return newClassroom.id
        })
        return classroomId

    } catch (error) {
        if (error instanceof Error) {
            console.log("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }

        return { success: false, message: "Error fetching prompts. Try again." };
    }
}