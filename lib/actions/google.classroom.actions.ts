"use server"
import { GoogleClassroom } from "@/types";
import { getValidAccessToken } from "./refresh.token.action";

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
        console.log('data in the route ', data)
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
export async function createClassroomWithGoogle(classroomId: string) {
    try {
        const accessToken = await getValidAccessToken()
        const res = await fetch(
            `https://classroom.googleapis.com/v1/courses/${classroomId}/students`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        if (!res.ok) {
            throw new Error(`Error fetching classrooms: ${res.statusText}`);
        }
        const data = await res.json();
        
        // const newClassroom = await prisma.classroom


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