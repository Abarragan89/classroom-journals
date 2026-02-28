"use server"
import { ResponseData, Rubric, AIGradingResult } from "@/types";
import { requireAuth } from "./authorization.action";
import { prisma } from "@/db/prisma";
import { openAiQueue, openAiQueueEvents } from "@/lib/queues";


export async function gradeResponseWithAI(
    responseId: string,
    gradeLevel: string,
    responseData: ResponseData[]
) {
    try {
        const session = await requireAuth();
        const teacherId = session?.user?.id;

        if (!teacherId) {
            throw new Error('Authentication required');
        }

        // Check AI allowance before queueing
        const teacher = await prisma.user.findUnique({
            where: { id: teacherId },
            select: { openAIAllowance: true, accountType: true, purchasedCredits: true }
        });

        const monthlyAllowance = teacher?.openAIAllowance || 0;
        const purchasedCredits = teacher?.purchasedCredits || 0;
        const totalAllowance = monthlyAllowance + purchasedCredits;

        if (!totalAllowance || totalAllowance <= 0) {
            return { success: false, message: 'AI grading allowance exhausted' };
        }

        // Set isAIGrading = true before queueing
        await prisma.response.update({
            where: { id: responseId },
            data: { isAIGrading: true }
        });

        // Add job to queue
        const job = await openAiQueue.add('grade-responses', {
            teacherId,
            responseId,
            gradeLevel,
            responseData
        });

        // Wait for job to complete
        try {
            const result = await job.waitUntilFinished(openAiQueueEvents);

            // Check if the job actually failed in the worker
            const jobState = await job.getState();
            if (jobState === 'failed') {
                throw new Error(job.failedReason || 'Worker job failed');
            }

            return result;
        } catch (workerError) {
            // Worker failed - reset isAIGrading flag
            await prisma.response.update({
                where: { id: responseId },
                data: { isAIGrading: false }
            });
            throw workerError; // Re-throw to be caught by outer catch
        }
    } catch (error) {
        console.error('error queueing autograde job', error);
        // Ensure isAIGrading is reset on any error
        await prisma.response.update({
            where: { id: responseId },
            data: { isAIGrading: false }
        }).catch(err => console.error('Failed to reset isAIGrading:', err));

        return { success: false, message: 'Failed to queue grading job' };
    }
}

export async function gradeRubricWithAI(
    rubric: Rubric,
    studentWriting: string,
    responseId: string,
    gradeLevel?: string,
    waitForCompletion: boolean = true,
): Promise<AIGradingResult> {
    try {
        const session = await requireAuth();
        const teacherId = session?.user?.id;

        if (!teacherId) {
            throw new Error('Authentication required');
        }

        // Check AI allowance before queueing
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

        // Set isAIGrading = true before queueing
        await prisma.response.update({
            where: { id: responseId },
            data: { isAIGrading: true }
        });


        // generate categories with max scores for each criterion
        const categories = rubric.categories.map((category) => ({
            name: category.name,
            selectedScore: 0,
            maxScore: Math.max(...category.criteria.map(c => c.score))
        }));

        await prisma.rubricGrade.upsert({
            where: {
                responseId: responseId
            },
            update: {
                rubricId: rubric.id,
                categories,
                totalScore: 0,
                maxTotalScore: 0,
                percentageScore: 0,
                comment: "",
                updatedAt: new Date()
            },
            create: {
                responseId,
                rubricId: rubric.id,
                teacherId,
                categories,
                totalScore: 0,
                maxTotalScore: 0,
                percentageScore: 0,
                comment: ""
            }
        });


        // Add job to queue
        const job = await openAiQueue.add('grade-rubric', {
            teacherId,
            rubric,
            studentWriting,
            responseId,
            gradeLevel
        });

        if (waitForCompletion) {
            // Wait for job to complete and return result
            try {
                // Wait for job to complete and return result
                const result = await job.waitUntilFinished(openAiQueueEvents);

                // Check if the job actually failed in the worker
                const jobState = await job.getState();
                if (jobState === 'failed') {
                    throw new Error(job.failedReason || 'Worker job failed');
                }

                return result;
            } catch (workerError) {
                // Worker failed - reset isAIGrading flag
                await prisma.response.update({
                    where: { id: responseId },
                    data: { isAIGrading: false }
                });
                throw workerError; // Re-throw to be caught by outer catch
            }
        } else {
            // Return immediately with job info for polling
            return {
                success: true,
                jobId: job.id as string,
                message: 'Grading job queued successfully'
            };
        }

    } catch (error) {
        console.error('Error queueing rubric grading:', error);
        // Ensure isAIGrading is reset on any error
        await prisma.response.update({
            where: { id: responseId },
            data: { isAIGrading: false }
        }).catch(err => console.error('Failed to reset isAIGrading:', err));

        return {
            success: false,
            message: 'Failed to queue grading job',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// Check job status
export async function checkGradingStatus(jobId: string) {
    try {
        const job = await openAiQueue.getJob(jobId);

        if (!job) {
            return { status: 'not-found' };
        }

        const state = await job.getState();

        if (state === 'completed') {
            return {
                status: 'completed',
                result: job.returnvalue
            };
        }

        if (state === 'failed') {
            return {
                status: 'failed',
                error: job.failedReason
            };
        }

        return { status: state }; // 'waiting', 'active', 'delayed'
    } catch (error) {
        console.error('Error checking job status:', error);
        return { status: 'error' };
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


