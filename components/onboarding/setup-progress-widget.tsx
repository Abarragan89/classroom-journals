'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ProgressStep from './progress-step';
import {
    OnboardingState,
    ONBOARDING_STEPS,
    calculateProgress,
    getNextStep,
} from '@/lib/onboarding-utils';

type SetupProgressWidgetProps = {
    completedSteps: OnboardingState;
    classId: string;
    teacherId: string;
};

export default function SetupProgressWidget({
    completedSteps,
    classId,
    teacherId,
}: SetupProgressWidgetProps) {
    // Calculate progress percentage
    const progressPercent = useMemo(
        () => calculateProgress(completedSteps),
        [completedSteps]
    );

    // Get the next incomplete step
    const nextStep = useMemo(
        () => getNextStep(completedSteps),
        [completedSteps]
    );

    return (
        <Card className="border-2 shadow-md">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Class Setup Progress</CardTitle>
                    <span className="text-2xl font-bold text-primary">
                        {progressPercent}%
                    </span>
                </div>
                <Progress value={progressPercent} className="h-2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-1">
                {ONBOARDING_STEPS.map((step, index) => {
                    const isCompleted = completedSteps[step.id];
                    const isActive = nextStep?.id === step.id;

                    return (
                        <ProgressStep
                            key={step.id}
                            label={step.label}
                            description={step.description}
                            isCompleted={isCompleted}
                            actionUrl={step.actionUrl(classId, teacherId)}
                            actionLabel={step.actionLabel}
                            stepNumber={index + 1}
                            isActive={isActive}
                        />
                    );
                })}
            </CardContent>
        </Card>
    );
}
