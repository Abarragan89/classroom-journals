"use server";
import { prisma } from "@/db/prisma";
import { requireAuth } from "./authorization.action";


// This is for the teacher to get notifications if there are requests, work as notifications
export async function createRubric(teacherId: string, rubricData: JSON) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error("Forbidden");
        }
        
        const 
    } catch (error) {
        // Improved error logging
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }
        return { success: false, message: 'Error adding student. Try again.' }
    }
}