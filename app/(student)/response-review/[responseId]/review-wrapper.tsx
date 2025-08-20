'use client';
import { ResponseData } from '@/types'
import { useState } from 'react'
import React from 'react'
import MultiQuestionReview from './multi-question-review'
import { Response } from '@/types';
import { useQuery } from '@tanstack/react-query';

export default function ReviewWrapper({
    singleResponse,
    responseId,
    isTeacherPremium,
    gradeLevel,
    studentId
}: {
    // if there is a responseId, then it's been given back to student
    // and needs the submit button here to update
    singleResponse: Response
    responseId: string,
    isTeacherPremium: boolean,
    gradeLevel: string,
    studentId: string
}) {

    const { data: responseData } = useQuery({
        queryKey: ['response-review', responseId],
        queryFn: async () => {
            const response = await fetch(`/api/responses/review/${responseId}?userId=${studentId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch student responses');
            }
            const data = await response.json();
            return data.response as Response;
        },
        initialData: singleResponse
    })
    const [questions, setQuestions] = useState<ResponseData[]>(responseData?.response as unknown as ResponseData[])

    return (
        <MultiQuestionReview
            allQuestions={questions}
            isSubmittable={responseData?.completionStatus === 'INCOMPLETE' || responseData?.completionStatus === 'RETURNED'}
            showGrades={responseData?.promptSession?.areGradesVisible as boolean}
            spellCheckEnabled={responseData?.spellCheckEnabled as boolean}
            gradeLevel={gradeLevel}
            isTeacherPremium={isTeacherPremium}
            setAllQuestions={setQuestions}
            responseId={responseId}
            studentId={studentId}
        />
    )
}
