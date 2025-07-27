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
    grade: z.string().optional(),
    color: z.string().min(1, 'Color is required'),
})

// Schema for creating a new prompt
export const promptSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    questions: z.array(
        z.object({
            question: z.string().min(1, 'Question is required'),
            answer: z.string().optional(),
            score: z.number().optional(),
        })
    ).min(1, 'At least one question is required'),
    promptType: z.string().optional()
})

export const newStudentSchema = z.object({
    name: z.string().min(1, 'name is required'),
    username: z.string().optional(),
    commentCoolDown: z.string().optional(),
    password: z.string().optional()
})

export const requestNewUsernameSchema = z.object({
    notificationText: z.string().min(2).max(20, 'Maximum of 20 characters'),
})

export const requestNewPromptSchema = z.object({
    notificationText: z.string().min(2),
})

export const rubricsSchema = z.object({
    categories: z.array(
        z.object({
            name: z.string().min(1, 'Category name is required'),
            criteriaByScore: z.array(z.string().min(1, 'Criteria is required')),
            scoreLevel: z.array(z.string().min(1, 'Score level is required'))
        })
    ).min(1, 'At least one category is required'),
    rubricName: z.string().min(1, 'Rubric name is required')
})
