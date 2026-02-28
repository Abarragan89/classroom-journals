import { Worker, Job } from 'bullmq'
import { connection } from '../lib/redis'
import OpenAI from 'openai'
import { prisma } from '../db/prisma'
import { ResponseData, Rubric } from '@/types'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

async function gradeResponses(job: Job) {
    const { teacherId, responseId, gradeLevel, responseData } = job.data as {
        teacherId: string;
        responseId: string;
        gradeLevel: string;
        responseData: ResponseData[]
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

        // Update the response in the database
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

        return { success: true, message: 'Response graded and saved successfully' };
    } catch (error) {
        // Reset isAIGrading flag on error
        await prisma.response.update({
            where: { id: responseId },
            data: { isAIGrading: false }
        }).catch(err => console.error('Failed to reset isAIGrading:', err));
        
        throw error; // Re-throw so BullMQ marks job as failed
    }
}

async function gradeRubric(job: Job) {
    const { teacherId, rubric, studentWriting, responseId, gradeLevel } = job.data as {
        teacherId: string;
        rubric: Rubric;
        studentWriting: string;
        responseId: string;
        gradeLevel?: string;
    };

    try {
        const gradeLevelString = gradeLevel
            ? `Grade this according to ${gradeLevel} level standards.`
            : `Grade this according to appropriate educational standards.`;

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

        const result = response.output_text;
        if (!result) {
            throw new Error('No response from OpenAI');
        }

        const parsedResult = JSON.parse(result);

        if (!parsedResult.scores || !Array.isArray(parsedResult.scores) || !parsedResult.comment) {
            throw new Error('Invalid response format from OpenAI');
        }

        if (parsedResult.comment.length > 500) {
            parsedResult.comment = parsedResult.comment.substring(0, 497) + '...';
        }

        // Prepare categories for database (matching RubricCategoryGrade structure)
        const categories = rubric.categories.map((category, idx) => ({
            name: category.name,
            selectedScore: parsedResult.scores[idx],
            maxScore: Math.max(...category.criteria.map(c => c.score))
        }));

        // Calculate totals
        const totalScore = parsedResult.scores.reduce((sum: number, score: number) => sum + score, 0);
        const maxTotalScore = categories.reduce((sum, cat) => sum + cat.maxScore, 0);
        const percentageScore = Math.round((totalScore / maxTotalScore) * 100);

        // Save rubric grade to database
        await prisma.rubricGrade.upsert({
            where: {
                responseId: responseId
            },
            update: {
                rubricId: rubric.id,
                categories,
                totalScore,
                maxTotalScore,
                percentageScore,
                comment: parsedResult.comment,
                updatedAt: new Date()
            },
            create: {
                responseId,
                rubricId: rubric.id,
                teacherId,
                categories,
                totalScore,
                maxTotalScore,
                percentageScore,
                comment: parsedResult.comment
            }
        });

        ////////////////////////////// Update the response in index 0 to give it a score on class average //////////////////////////
        // Fetch the current response
        const existingResponse = await prisma.response.findUnique({
            where: { id: responseId },
            select: { response: true },
        });

        if (!existingResponse) {
            throw new Error("Response not found");
        }

        // Clone and update the response JSON
        // @ts-expect-error: may be error  with typing response
        const updatedResponse = [...existingResponse.response as InputJsonValue[]];
        if (!updatedResponse[0]) {
            throw new Error("Invalid question index");
        }

        updatedResponse[0].score = percentageScore;

        // // Save the updated response
        await prisma.response.update({
            where: { id: responseId },
            data: {
                response: updatedResponse,
            },
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

        // Return result matching original function signature
        return {
            success: true,
            scores: parsedResult.scores,
            comment: parsedResult.comment
        };
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
    'openai',
    async (job: Job) => {
        console.log(`Processing job ${job.id} of type ${job.name}`);

        try {
            if (job.name === 'grade-responses') {
                return await gradeResponses(job);
            } else if (job.name === 'grade-rubric') {
                return await gradeRubric(job);
            } else {
                throw new Error(`Unknown job type: ${job.name}`);
            }
        } catch (error) {
            console.error(`Job ${job.id} failed:`, error);
            throw error;
        }
    },
    {
        connection,
        concurrency: 5, // Process 5 jobs at once
    }
);

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with error:`, err);
});

console.log('OpenAI Worker started and listening for jobs...');