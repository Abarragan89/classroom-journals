'use server';
import { prisma } from "@/db/prisma";
import { classSchema } from "../validators";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

// Create a new class
export async function createNewClass(prevState: unknown, formData: FormData) {
    try {
        console.log('class in the form data part ', formData)
        const { name, subject, room, period, color } = classSchema.parse({
            name: formData.get('name'),
            subject: formData.get('subject'),
            room: formData.get('room'),
            period: formData.get('period'),
            color: formData.get('color')
        })
        await prisma.class.create({
            data: {
                name,
                subject,
                room,
                period,
                color
            }
        })
        redirect('/dashboard')
    } catch (error) {
        console.log('error creating classroom', error)
        if (isRedirectError(error)) {
            throw error
        }
        return { success: false, message: 'Error creating class. Try again.' }
    }
}