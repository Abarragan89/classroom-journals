'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import OnboardingToast from './onboarding-toast';
import {
    OnboardingState,
    loadOnboardingProgress,
    saveOnboardingProgress,
    initializeOnboardingState,
    dismissOnboarding,
    detectCompletionState,
} from '@/lib/onboarding-utils';
import { PromptSession, SearchOptions, User } from '@/types';

type OnboardingFlowProps = {
    classId: string;
    teacherId: string;
    initialStudentCount: number;
    initialJotCount: number;
    initialAssignmentCount: number;
};

export default function OnboardingFlow({
    classId,
    teacherId,
    initialStudentCount,
    initialJotCount,
    initialAssignmentCount,
}: OnboardingFlowProps) {

    const searchParams = useSearchParams();
    const router = useRouter();
    const isNewClass = searchParams?.get('newClass') === 'true';
    const fromGoogleImport = searchParams?.get('googleImport') === 'true';

    // Initialize state from localStorage or create new
    const [onboardingState, setOnboardingState] = useState<OnboardingState>(() => {
        if (typeof window === 'undefined') {
            return {
                createClass: true,
                addStudents: initialStudentCount > 0,
                makeJot: initialJotCount > 0,
                assignJot: initialAssignmentCount > 0,
            };
        }

        const saved = loadOnboardingProgress(classId);

        if (saved && !saved.isDismissed) {
            return saved.completedSteps;
        }

        // Initialize new state
        const newState = initializeOnboardingState(classId);
        newState.completedSteps.addStudents = initialStudentCount > 0;
        newState.completedSteps.makeJot = initialJotCount > 0;
        newState.completedSteps.assignJot = initialAssignmentCount > 0;

        return newState.completedSteps;
    });

    const [isDismissed, setIsDismissed] = useState(() => {
        if (typeof window === 'undefined') return false;
        const saved = loadOnboardingProgress(classId);
        return saved?.isDismissed ?? false;
    });

    // Only run queries if onboarding should be shown (not dismissed)
    const shouldShowOnboarding = !isDismissed;

    // Query for real-time student count
    const { data: students } = useQuery({
        queryKey: ['getStudentRoster', classId],
        queryFn: async () => {
            const response = await fetch(`/api/classrooms/get-all-students?classId=${classId}&teacherId=${teacherId}`);
            if (!response.ok) throw new Error('Failed to fetch student roster');
            const { students } = await response.json();
            return students as User[];
        },
        enabled: shouldShowOnboarding,
        staleTime: 0,
    });

    const searchOptions: SearchOptions = {
        category: '',
        filter: '',
        paginationSkip: 0,
        searchWords: ''
    };


    // Query for real-time assignment count
    const { data: assignments } = useQuery({
        queryKey: ['assignmentListDash', classId, searchOptions],
        queryFn: async () => {
            const response = await fetch(`/api/prompt-sessions/class/${classId}?teacherId=${teacherId}`);
            if (!response.ok) throw new Error('Failed to fetch assignments');
            const { prompts } = await response.json();
            return prompts as PromptSession[];
        },
        enabled: shouldShowOnboarding,
        staleTime: 0,
        refetchOnMount: 'always',
    });


    const { data: teacherJotsData } = useQuery({
        queryKey: ['prompts', teacherId, searchOptions],
        queryFn: async () => {
            const queryParams = new URLSearchParams({
                teacherId,
                category: searchOptions.category || "",
                searchWords: searchOptions.searchWords || "",
                filter: searchOptions.filter || "",
                paginationSkip: searchOptions.paginationSkip.toString(),
            });

            const res = await fetch(`/api/prompts/filtered?${queryParams}`);
            if (!res.ok) throw new Error("Failed to fetch");
            return (await res.json()).prompts;
        },
        staleTime: 0,
        refetchOnMount: 'always',
        enabled: shouldShowOnboarding,
    });

    // Handle Google Classroom import - marks both class and roster as complete
    useEffect(() => {
        if (isDismissed) return;
        if (fromGoogleImport && students && students.length > 0) {
            const updatedState = {
                ...onboardingState,
                createClass: true,
                addStudents: true,
            };
            setOnboardingState(updatedState);

            const progress = loadOnboardingProgress(classId) || initializeOnboardingState(classId);
            progress.completedSteps = updatedState;
            saveOnboardingProgress(progress);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromGoogleImport, students, classId, isDismissed]);

    // Auto-detect and update completion states based on actual data
    useEffect(() => {
        if (isDismissed) return;
        const currentStudentCount = students?.length ?? initialStudentCount;
        const currentAssignmentCount = assignments?.length ?? initialAssignmentCount;
        const currentJotCount = teacherJotsData?.totalCount ?? initialJotCount;

        const detectedState = detectCompletionState({
            hasClass: true,
            studentCount: currentStudentCount,
            jotCount: currentJotCount,
            assignmentCount: currentAssignmentCount,
        });

        // Redirect to classroom is coming back from making a jot and assigning it directly
        if (Object.values(detectedState).every(value => value === true)) {
            router.push(`/classroom/${classId}/${teacherId}`);
        }


        // Only update if there are actual changes
        const hasChanges = Object.keys(detectedState).some(
            (key) => detectedState[key as keyof OnboardingState] !== onboardingState[key as keyof OnboardingState]
        );

        if (hasChanges) {
            setOnboardingState(detectedState);

            const progress = loadOnboardingProgress(classId) || initializeOnboardingState(classId);
            progress.completedSteps = detectedState;
            saveOnboardingProgress(progress);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [students, assignments, teacherJotsData, classId, initialStudentCount, initialAssignmentCount, initialJotCount, isDismissed, router, teacherId]);

    const handleDismiss = () => {
        setIsDismissed(true);
        dismissOnboarding(classId);
    };

    // Don't show onboarding if dismissed (show briefly at 100% before auto-dismiss)
    if (isDismissed) return null;

    return (
        <OnboardingToast
            completedSteps={onboardingState}
            classId={classId}
            teacherId={teacherId}
            onDismiss={handleDismiss}
            isNewClass={isNewClass}
        />
    );
}
