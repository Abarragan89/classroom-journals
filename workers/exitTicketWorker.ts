import { Worker, Job } from 'bullmq'
import { connection } from '../lib/redis'
import OpenAI from 'openai'
import { prisma } from '../db/prisma'
import { ResponseData } from '@/types'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

async function gradeExitTicket(job: Job) {
    const { teacherId, responseId, gradeLevel, responseData } = job.data as {
        teacherId: string;
        responseId: string;
        responseData: ResponseData[];
        gradeLevel?: string;
    };

    try {
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

        const scoresText = response.output_text;
        if (!scoresText) {
            throw new Error('No response from OpenAI');
        }

        // Parse and merge scores into response data
        const scores = JSON.parse(scoresText);
        const gradedResponseData = responseData.map((res: ResponseData, index: number) => {
            if (scores[index] === null) {
                return res;
            } else {
                return { ...res, score: parseFloat(scores[index]) };
            }
        });

        // Update the response in the database with graded data
        await prisma.response.update({
            where: { id: responseId },
            data: {
                response: gradedResponseData as any,
            }
        });

        // Deduct allowance after successful grading
        const teacher = await prisma.user.findUnique({
            where: { id: teacherId },
            select: { purchasedCredits: true }
        });

        if (teacher && teacher.purchasedCredits > 0) {
            await prisma.user.update({
                where: { id: teacherId },
                data: { purchasedCredits: { decrement: 1 } }
            });
        } else {
            await prisma.user.update({
                where: { id: teacherId },
                data: { openAIAllowance: { decrement: 1 } }
            });
        }

        // Reset isAIGrading flag after successful grading
        await prisma.response.update({
            where: { id: responseId },
            data: { isAIGrading: false }
        });

        return { success: true, message: 'Exit ticket graded and saved successfully' };
    } catch (error) {
        // Reset isAIGrading flag on error
        await prisma.response.update({
            where: { id: responseId },
            data: { isAIGrading: false }
        }).catch(err => console.error('Failed to reset isAIGrading:', err));

        throw error; // Re-throw so BullMQ marks job as failed
    }
}

const worker = new Worker(
    'exit-ticket',
    async (job: Job) => {
        console.log(`Processing exit ticket job ${job.id} of type ${job.name}`);

        try {
            if (job.name === 'grade-exit-ticket') {
                return await gradeExitTicket(job);
            } else {
                throw new Error(`Unknown job type: ${job.name}`);
            }
        } catch (error) {
            console.error(`Exit ticket job ${job.id} failed:`, error);
            throw error;
        }
    },
    {
        connection,
        concurrency: 5, // Exit tickets are fast (5-7s), allow higher concurrency
    }
);

worker.on('completed', (job) => {
    console.log(`Exit ticket job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
    console.error(`Exit ticket job ${job?.id} failed with error:`, err);
});

console.log('Exit Ticket Worker started and listening for jobs...');
