"use server"
import { GoogleClassroom } from "@/types";
export async function getTeacherClassroom(accessToken: string, googleProviderId: string) {
    
    try {
        const res = await fetch(
            `https://classroom.googleapis.com/v1/courses`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        // const res = await fetch(
        //     `https://classroom.googleapis.com/v1/courses/702952003278/students`,
        //     {
        //         headers: {
        //             Authorization: `Bearer ${accessToken}`,
        //         },
        //     }
        // );

        // if (!res.ok) {
        //     throw new Error(`Error fetching classrooms: ${res.statusText}`);
        // }

        const data = await res.json();
        const currentClassrooms = data.courses.filter((currentClass: GoogleClassroom) => currentClass.courseState === 'ACTIVE' && currentClass.ownerId === googleProviderId)

        console.log('data in', currentClassrooms)
        return data.courses || [];


        // return data.students || [];
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