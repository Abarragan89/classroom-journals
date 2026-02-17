'use client';

import { useState } from 'react';
import OnboardingFlow from './onboarding-flow';
import { loadOnboardingProgress } from '@/lib/onboarding-utils';

type OnboardingFlowWrapperProps = {
    classId: string;
    teacherId: string;
    initialStudentCount: number;
    initialJotCount: number;
    initialAssignmentCount: number;
};

export default function OnboardingFlowWrapper({
    classId,
    teacherId,
    initialStudentCount,
    initialJotCount,
    initialAssignmentCount,
}: OnboardingFlowWrapperProps) {
    const [shouldRender, setShouldRender] = useState(() => {
        if (typeof window === 'undefined') return false;
        const saved = loadOnboardingProgress(classId);
        return !(saved?.isDismissed ?? false);
    });

    const handleDismissed = () => {
        setShouldRender(false);
    };

    if (!shouldRender) return null;

    return (
        <OnboardingFlow
            classId={classId}
            teacherId={teacherId}
            initialStudentCount={initialStudentCount}
            initialJotCount={initialJotCount}
            initialAssignmentCount={initialAssignmentCount}
            onDismissed={handleDismissed}
        />
    );
}
