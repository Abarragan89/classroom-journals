/**
 * Onboarding Progress Tracking Utilities
 * Handles local storage persistence and completion state for teacher onboarding
 */

export type OnboardingStep =
    | 'createClass'
    | 'addStudents'
    | 'makeJot'
    | 'assignJot';

export type OnboardingStepInfo = {
    id: OnboardingStep;
    label: string;
    description: string;
    actionUrl: (classId: string, teacherId: string) => string;
    actionLabel: string;
};

export type OnboardingState = {
    [key in OnboardingStep]: boolean;
};

export type OnboardingProgress = {
    classId: string;
    completedSteps: OnboardingState;
    isDismissed: boolean;
    lastUpdated: string;
};

/**
 * Onboarding step definitions with labels and action URLs
 */
export const ONBOARDING_STEPS: OnboardingStepInfo[] = [
    {
        id: 'createClass',
        label: 'Create a Class',
        description: 'Set up your first classroom',
        actionUrl: () => '/classes',
        actionLabel: 'Create Class',
    },
    {
        id: 'addStudents',
        label: 'Add Students to Roster',
        description: 'Build your class roster',
        actionUrl: (classId, teacherId) => `/classroom/${classId}/${teacherId}/roster`,
        actionLabel: 'Add Students',
    },
    {
        id: 'makeJot',
        label: 'Make a Jot',
        description: 'Create your first prompt',
        actionUrl: () => '/prompt-form?type=BLOG',
        actionLabel: 'Create Jot',
    },
    {
        id: 'assignJot',
        label: 'Assign a Jot',
        description: 'Post an assignment to your class',
        actionUrl: (classId, teacherId) => `/classroom/${classId}/${teacherId}`,
        actionLabel: 'View Assignments',
    },
];

/**
 * Get the local storage key for a specific class
 */
const getStorageKey = (classId: string): string => `onboarding_${classId}`;

/**
 * Load onboarding progress from localStorage
 */
export const loadOnboardingProgress = (classId: string): OnboardingProgress | null => {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem(getStorageKey(classId));
        if (!stored) return null;
        return JSON.parse(stored);
    } catch (error) {
        console.error('Error loading onboarding progress:', error);
        return null;
    }
};

/**
 * Save onboarding progress to localStorage
 */
export const saveOnboardingProgress = (progress: OnboardingProgress): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(
            getStorageKey(progress.classId),
            JSON.stringify({ ...progress, lastUpdated: new Date().toISOString() })
        );
    } catch (error) {
        console.error('Error saving onboarding progress:', error);
    }
};

/**
 * Initialize onboarding state for a new class
 */
export const initializeOnboardingState = (classId: string): OnboardingProgress => {
    return {
        classId,
        completedSteps: {
            createClass: true, // Always true since they're viewing the class
            addStudents: false,
            makeJot: false,
            assignJot: false,
        },
        isDismissed: false,
        lastUpdated: new Date().toISOString(),
    };
};

/**
 * Dismiss the onboarding flow
 */
export const dismissOnboarding = (classId: string): void => {
    const current = loadOnboardingProgress(classId) || initializeOnboardingState(classId);
    current.isDismissed = true;
    saveOnboardingProgress(current);
};

/**
 * Calculate completion percentage based on completed steps
 */
export const calculateProgress = (completedSteps: OnboardingState): number => {
    const steps = Object.values(completedSteps);
    const completed = steps.filter(Boolean).length;
    return Math.round((completed / steps.length) * 100);
};

/**
 * Check if all steps are completed
 */
export const isOnboardingComplete = (completedSteps: OnboardingState): boolean => {
    return Object.values(completedSteps).every(Boolean);
};

/**
 * Get the next incomplete step
 */
export const getNextStep = (completedSteps: OnboardingState): OnboardingStepInfo | null => {
    return ONBOARDING_STEPS.find(step => !completedSteps[step.id]) || null;
};

/**
 * Detect completion state from actual data
 */
export const detectCompletionState = (data: {
    hasClass: boolean;
    studentCount: number;
    jotCount: number;
    assignmentCount: number;
}): OnboardingState => {
    return {
        createClass: data.hasClass,
        addStudents: data.studentCount > 0,
        makeJot: data.jotCount > 0,
        assignJot: data.assignmentCount > 0,
    };
};
