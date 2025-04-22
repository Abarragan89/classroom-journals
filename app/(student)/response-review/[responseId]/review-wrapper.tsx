'use client';
import { ResponseData } from '@/types'
import { useState } from 'react'
import React from 'react'
import MultiQuestionReview from './multi-question-review'

export default function ReviewWrapper({
    allQuestions,
    isSubmittable,
    responseId,
    showGrades,
    isTeacherPremium,
    gradeLevel
}: {
    allQuestions: ResponseData[],
    isSubmittable: boolean,
    // if there is a responseId, then it's been given back to student
    // and needs the submit button here to update
    responseId?: string,
    showGrades: boolean
    isTeacherPremium: boolean,
    gradeLevel: string
}) {

    const [questions, setQuestions] = useState<ResponseData[]>(allQuestions)

    return (
        <MultiQuestionReview
            allQuestions={questions}
            setAllQuestions={setQuestions}
            isSubmittable={isSubmittable}
            responseId={responseId}
            showGrades={showGrades}
            isTeacherPremium={isTeacherPremium}
            gradeLevel={gradeLevel}
        />
    )
}
