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
    onDismissed?: () => void;
};

export default function OnboardingFlow({
    classId,
    teacherId,
    initialStudentCount,
    initialJotCount,
    initialAssignmentCount,
    onDismissed,
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

        if (saved) {
            return saved.completedSteps;
        }

        // Initialize new state
        const newState = initializeOnboardingState(classId);
        newState.completedSteps.addStudents = initialStudentCount > 0;
        newState.completedSteps.makeJot = initialJotCount > 0;
        newState.completedSteps.assignJot = initialAssignmentCount > 0;

        return newState.completedSteps;
    });

    // Query for real-time student count
    const { data: students } = useQuery({
        queryKey: ['getStudentRoster', classId],
        queryFn: async () => {
            const response = await fetch(`/api/classrooms/get-all-students?classId=${classId}&teacherId=${teacherId}`);
            if (!response.ok) throw new Error('Failed to fetch student roster');
            const { students } = await response.json();
            return students as User[];
        },
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
    });

    // Handle Google Classroom import - marks both class and roster as complete
    useEffect(() => {
        if (fromGoogleImport && students && students.length > 0) {
            const updatedState = {
                ...onboardingState,
                createClass: true,
                addStudents: true,
            };
            // Syncing external Google Classroom import data with local state - safe and intentional
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOnboardingState(updatedState);

            const progress = loadOnboardingProgress(classId) || initializeOnboardingState(classId);
            progress.completedSteps = updatedState;
            saveOnboardingProgress(progress);
        }
    }, [fromGoogleImport, students, classId, onboardingState]);

    // Auto-detect and update completion states based on actual data
    useEffect(() => {
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
            // Syncing real-time API query results with onboarding state - guarded by hasChanges check
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOnboardingState(detectedState);

            const progress = loadOnboardingProgress(classId) || initializeOnboardingState(classId);
            progress.completedSteps = detectedState;
            saveOnboardingProgress(progress);
        }
    }, [students, assignments, teacherJotsData, classId, initialStudentCount, initialAssignmentCount, initialJotCount, router, teacherId, onboardingState]);

    const handleDismiss = () => {
        dismissOnboarding(classId);
        // Notify wrapper to unmount this component
        onDismissed?.();
    };

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
