import { getAllStudents } from '@/lib/actions/classroom.actions';
import { getSinglePromptSessionTeacherDashboard } from '@/lib/actions/prompt.session.actions';
import { PromptSession, Question, User } from '@/types';
import React from 'react'
import ClientQuestionControls from './client-question-controls';

export default async function ReviewAssessmentQuestions({
    params
}: {
    params: Promise<{ classId: string, teacherId: string, sessionId: string }>
}) {

    const { sessionId, classId, teacherId } = await params;

    if (!sessionId) {
        return <div>No session ID provided</div>;
    }

    const promptSession = await getSinglePromptSessionTeacherDashboard(sessionId) as unknown as PromptSession

    if (!promptSession) {
        return <div>Prompt session not found</div>;
    }

    return (
        <>
            <h2 className="text-xl lg:text-2xl line-clamp-3 mt-5">{promptSession?.prompt?.title}</h2>
            <ClientQuestionControls
                questions={promptSession?.questions as unknown as Question[]}
            />
        </>
    )
}
