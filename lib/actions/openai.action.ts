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

        // Add job to queue
        const job = await openAiQueue.add('grade-responses', {
            teacherId,
            responseId,
            gradeLevel,
            responseData
        });

        // Wait for job to complete
        const result = await job.waitUntilFinished(openAiQueueEvents);

        return result;
    } catch (error) {
        console.error('error queueing autograde job', error)
        return { success: false, message: 'Failed to queue grading job' }
    }
}

export async function gradeRubricWithAI(
    rubric: Rubric,
    studentWriting: string,
    responseId: string,
    gradeLevel?: string,
    waitForCompletion: boolean = true
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
            const result = await job.waitUntilFinished(openAiQueueEvents);
            return result;
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


