"use server"
import { ResponseData, Rubric, AIGradingResult } from "@/types";
import OpenAI from "openai";
import { requireAuth } from "./authorization.action";
import { prisma } from "@/db/prisma";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

export async function gradeResponseWithAI(gradeLevel: string, responseData: ResponseData[]) {
    try {
        await requireAuth();
        const gradeLevelString = gradeLevel
            ? `You are an expert teacher. Grade each answer according to a ${gradeLevel} level.`
            : `You are an expert teacher. Grade each answer appropriately based on general educational standards.`

        const systemPrompt = `
            ${gradeLevelString}
    
            Your task is to score student responses based on the correctness of their answers.
    
            Follow these strict rules when assigning scores:
            - Use only the values: 1 (fully correct), 0.5 (partially correct), or 0 (incorrect)
            - If the answer is factually correct, accept it even if it is unconventional
            - If the spelling is close but the intent is clear, accept the answer
            - Return the JavaScript value null if the you cannot answer the question, or the question or answer is unclear or unintelligible
            - **Do not** include explanations, comments, or extra output
            - Your response should ONLY be an array of numbers, e.g.,: [1, 0.5, 0]
    
            Grade the following:
        `

        const questions = responseData.map((r, i) => `${i + 1}. ${r.question}`).join('\n');
        const answers = responseData.map((r, i) => `${i + 1}. ${r.answer}`).join('\n');

        const response = await openai.responses.create({
            model: "gpt-4o-mini",
            instructions: systemPrompt.trim(),
            input: [
                {
                    role: "user",
                    content: `Questions:\n${questions}\n\nAnswers:\n${answers}`
                }
            ],
            text: {
                format: { type: "text" }
            },
            temperature: 0.0,
            max_output_tokens: 300,
        });
        return response;

    } catch (error) {
        console.log('error wiht open ai autograde ', error)
        return { output_text: 'error' }
    }
}

export async function gradeRubricWithAI(rubric: Rubric, studentWriting: string, gradeLevel?: string, responseId?: string): Promise<AIGradingResult> {
    try {
        const session = await requireAuth();
        const teacherId = session?.user?.id;

        if (!teacherId) {
            throw new Error('Authentication required');
        }

        // Check AI allowance before processing
        const teacher = await prisma.user.findUnique({
            where: { id: teacherId },
            select: { openAIAllowance: true, accountType: true }
        });

        if (!teacher?.openAIAllowance || teacher.openAIAllowance <= 0) {
            return {
                success: false,
                message: 'AI grading allowance exhausted. Allowance resets with your next billing cycle.',
                error: 'No allowance remaining'
            };
        }

        const gradeLevelString = gradeLevel
            ? `Grade this according to ${gradeLevel} level standards.`
            : `Grade this according to appropriate educational standards.`;

        // Format rubric categories and criteria for the AI
        const rubricDescription = rubric.categories.map((category, catIndex) => {
            const criteriaList = category.criteria.map((criterion, critIndex) =>
                `${criterion.score} points: ${criterion.description}`
            ).join('\n    ');

            return `Category ${catIndex + 1}: ${category.name}\n  Criteria:\n    ${criteriaList}`;
        }).join('\n\n');

        const systemPrompt = `
            You are an expert teacher using a rubric to grade student writing. ${gradeLevelString}
            
            Your task is to:
            1. Score each category based on the rubric criteria
            2. Provide constructive feedback
            
            RUBRIC:
            ${rubricDescription}
            
            REQUIREMENTS:
            - Score each category using ONLY the exact point values from the rubric criteria
            - Provide feedback that is positive, constructive, and under 500 characters
            - Include what the student did well, areas for improvement, and specific suggestions
            - Be encouraging while being honest about areas needing work
            
            RESPONSE FORMAT (respond with valid JSON only):
            {
                "scores": [score1, score2, score3, ...],
                "comment": "Your feedback here (under 500 characters)"
            }
            
            The scores array should contain one score for each category in the order they appear in the rubric.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: systemPrompt.trim()
                },
                {
                    role: "user",
                    content: `Please grade this student writing:\n\n${studentWriting}`
                }
            ],
            temperature: 0.3,
            max_tokens: 800,
            response_format: { type: "json_object" }
        });

        const result = response.choices[0]?.message?.content;
        if (!result) {
            throw new Error('No response from OpenAI');
        }

        const parsedResult = JSON.parse(result);

        // Validate the response structure
        if (!parsedResult.scores || !Array.isArray(parsedResult.scores) || !parsedResult.comment) {
            throw new Error('Invalid response format from OpenAI');
        }

        // Ensure comment is under 500 characters
        if (parsedResult.comment.length > 500) {
            parsedResult.comment = parsedResult.comment.substring(0, 497) + '...';
        }

        // Deduct allowance AFTER successful AI call
        await prisma.user.update({
            where: { id: teacherId },
            data: {
                openAIAllowance: {
                    decrement: 1
                }
            }
        });

        return {
            success: true,
            scores: parsedResult.scores,
            comment: parsedResult.comment
        };

    } catch (error) {
        console.error('Error with OpenAI rubric grading:', error);
        return {
            success: false,
            message: 'Failed to grade with AI. Please try again.',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// Get current AI allowance for a teacher
export async function getTeacherAIAllowance(): Promise<number> {
    try {
        const session = await requireAuth();
        const teacherId = session?.user?.id;

        if (!teacherId) {
            return 0;
        }

        const teacher = await prisma.user.findUnique({
            where: { id: teacherId },
            select: { openAIAllowance: true }
        });

        return teacher?.openAIAllowance || 0;
    } catch (error) {
        console.error('Error getting AI allowance:', error);
        return 0;
    }
}

// Check if AI grading is available
export async function canUseAIGrading(): Promise<boolean> {
    try {
        const allowance = await getTeacherAIAllowance();
        return allowance > 0;
    } catch (error) {
        console.error('Error checking AI grading availability:', error);
        return false;
    }
}


