import { z } from "zod";

//  Schema for signing users in
export const signInFormSchema = z.object({
    email: z.string().email('Invalid email address')
})


// Schema for creating a new class
export const classSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    subject: z.string().optional(),
    year: z.string().min(1, 'Year is required'),
    period: z.string().optional(),
    color: z.string().min(1, 'Color is required'),
})

// Schema for creating a new prompt
export const promptSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    questions: z.array(
        z.object({
            content: z.string().min(1, 'Question text is required')
        })
    ).min(1, 'At least one question is required')
})