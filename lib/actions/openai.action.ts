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

            Your task is to score student responses based on the factual correctness of their answers.

            Strict grading rules:
            - For math or factual questions, calculate or verify the correct answer step-by-step before scoring.
            - Use only: 1 (fully correct), 0.5 (partially correct), 0 (incorrect)
            - Accept unconventional but correct answers.
            - Accept spelling errors if intent is clear.
            - Respond ONLY with an array of numbers, e.g., [1, 0.5, 0]
            - Return null for that item in the array if the question or answer is unclear or unintelligible.
            - Do NOT include explanations, comments, or extra output.

            Example:
            Questions:
            1. What is 2 + 2?
            2. What is the capital of France?
            3. What is the boiling point of water?
            4. What is photosynthesis?
            5. When did we land on the moon?
            Answers:
            1. 4
            2. Paris
            3. 10 degrees Celsius
            4. How plants eat
            5. jaweoifj;afj

            Expected output: [1, 1, 0, 0.5, null]

            Grade the following:
        `

        const questions = responseData.map((r, i) => `${i + 1}. ${r.question}`).join('\n');
        const answers = responseData.map((r, i) => `${i + 1}. ${r.answer}`).join('\n');

        const response = await openai.responses.create({
            model: "gpt-5-nano",
            reasoning: { effort: 'medium' },
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
            max_output_tokens: 4500,
        });

        console.log('responses in the ai ', response)
        return response;
    } catch (error) {
        console.error('error with open ai autograde ', error)
        return { output_text: 'error' }
    }
}

export async function gradeRubricWithAI(rubric: Rubric, studentWriting: string, gradeLevel?: string): Promise<AIGradingResult> {
    try {
        const session = await requireAuth();
        const teacherId = session?.user?.id;

        if (!teacherId) {
            throw new Error('Authentication required');
        }

        // Check AI allowance before processing
        const teacher = await prisma.user.findUnique({
            where: { id: teacherId },
            select: { openAIAllowance: true, accountType: true, purchasedCredits: true }
        });

        const monthlyAllowance = teacher?.openAIAllowance || 0;
        const purchasedCredits = teacher?.purchasedCredits || 0;
        const totalAllowance = monthlyAllowance + purchasedCredits;

        if (!totalAllowance || totalAllowance <= 0) {
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
            const criteriaList = category.criteria.map((criterion) =>
                `${criterion.score} points: ${criterion.description}`
            ).join('\n    ');

            return `Category ${catIndex + 1}: ${category.name}\n  Criteria:\n    ${criteriaList}`;
        }).join('\n\n');

        const systemPrompt = `
            You are an expert teacher using a rubric to grade student writing. You are a stern grader looking for clarity, complete paragraphs, and relevant details ${gradeLevelString}
            
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

        const response = await openai.responses.create({
            model: "gpt-5-nano",
            reasoning: { effort: 'medium' },
            input: [
                {
                    role: "system",
                    content: systemPrompt.trim()
                },
                {
                    role: "user",
                    content: `Please grade this student writing:\n\n${studentWriting}`
                }
            ],
            max_output_tokens: 4500,
            text: {
                format: { type: "json_object" }
            }
        });

        const result = response.output_text
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

        // Deduct allowance AFTER successful AI call Deduct Purchased Credits first
        if (purchasedCredits > 0) {
            await prisma.user.update({
                where: { id: teacherId },
                data: {
                    purchasedCredits: {
                        decrement: 1
                    }
                }
            });
        } else {
            await prisma.user.update({
                where: { id: teacherId },
                data: {
                    openAIAllowance: {
                        decrement: 1
                    }
                }
            });
        }

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
            select: { openAIAllowance: true, purchasedCredits: true }
        });

        // Fix: Handle null values properly
        const monthlyAllowance = teacher?.openAIAllowance || 0;
        const purchasedCredits = teacher?.purchasedCredits || 0;

        return monthlyAllowance + purchasedCredits;

    } catch (error) {
        console.error('Error getting AI allowance:', error);
        return 0;
    }
}


