import { z } from "zod";

//  Schema for signing users in
export const signInFormSchema = z.object({
    email: z.string().email('Invalid email address')
})


// Schema for creating a new class
export const classSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    subject: z.string().optional(),
    room: z.string().optional(),
    period: z.string().optional(),
    color: z.string().min(1, 'Color is required'),
})