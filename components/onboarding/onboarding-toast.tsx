'use client';

import { JSX, useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { X, Sidebar } from 'lucide-react';
import { OnboardingState, calculateProgress, getNextStep, isOnboardingComplete } from '@/lib/onboarding-utils';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import OnboardingCard from './onboarding-card';
import ProgressStep from './progress-step';

type OnboardingToastProps = {
    completedSteps: OnboardingState;
    classId: string;
    teacherId: string;
    onDismiss: () => void;
    isNewClass?: boolean;
};

export default function OnboardingToast({
    completedSteps,
    classId,
    teacherId,
    onDismiss,
    isNewClass = false,
}: OnboardingToastProps) {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const pathname = usePathname();

    // Get the last segment of the URL path
    const currentPage = useMemo(() => {
        const segments = pathname?.split('/').filter(Boolean) || [];
        return segments[segments.length - 1] || '';
    }, [pathname]);

    // Calculate progress percentage
    const progressPercent = useMemo(() => calculateProgress(completedSteps), [completedSteps]);

    // Check if complete
    const isComplete = useMemo(() => isOnboardingComplete(completedSteps), [completedSteps]);

    // Get the next incomplete step
    const nextStep = useMemo(() => getNextStep(completedSteps), [completedSteps]);

    // Get navigation guidance based on next step
    const navigationGuidance = useMemo(() => {
        if (!nextStep) return null;

        const guidanceMap: Record<string, { desktop: JSX.Element; mobile: JSX.Element }> = {
            addStudents: {
                desktop: currentPage === 'roster'
                    ? <>Add at least 1 student to complete this step</>
                    : <>Click &quot;Roster&quot; in the sidebar to add students</>,
                mobile: currentPage === 'roster'
                    ? <>Add at least 1 student to complete this step</>
                    : <>Open the <Sidebar className="inline h-3.5 w-3.5 mx-0.5" /> menu and tap &quot;Roster&quot; to add students</>,
            },
            makeJot: {
                desktop: currentPage === 'jots'
                    ? <>Click &quot;+ Create Jot&quot; above to create your first prompt</>
                    : <>Click the &quot;Jots&quot; link in the sidebar to create your first prompt</>,
                mobile: currentPage === 'jots'
                    ? <>Tap &quot;+ Create Jot&quot; above to create your first prompt</>
                    : <>Open the <Sidebar className="inline h-3.5 w-3.5 mx-0.5" /> menu and tap &quot;Jots&quot; to create your first prompt</>,
            },
            assignJot: {
                desktop: currentPage === 'jots'
                    ? <>This is your Jot Library. Assign one to this class.</>
                    : <>Click the &quot;Jots&quot; link in the sidebar to assign your first prompt</>,
                mobile: currentPage === 'jots'
                    ? <>This is your Jot Library. Assign one to this class.</>
                    : <>Open the <Sidebar className="inline h-3.5 w-3.5 mx-0.5" /> menu and tap &quot;Jots&quot; to assign your first prompt</>,
            },
        };

        return guidanceMap[nextStep.id] || null;
    }, [nextStep, currentPage]);

    return (
        <div
            className={cn(
                'fixed bottom-5 left-1/2 -translate-x-1/2 z-50',
                'w-[calc(100%-2rem)] max-w-2xl',
                'bg-card border-2 border-primary/40 rounded-lg shadow-2xl',
                'p-4 animate-in slide-in-from-bottom-5 duration-300',
                'print:hidden'
            )}
        >
            {/* Dismiss Button */}
            <button
                onClick={onDismiss}
                className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-accent transition-colors group"
                aria-label="Dismiss onboarding"
            >
                <X className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            </button>
            <div className="flex">
                <div className="pr-8">
                    {/* Header with Progress */}
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold">
                            {isNewClass ? '🎉 Welcome!' : 'Setup Progress'}
                        </h3>
                        <span className="text-sm font-bold text-primary tabular-nums">{progressPercent}%</span>
                    </div>

                    <Progress value={progressPercent} className="h-1.5 mb-3" />

                    {/* Next Step or Completion Message */}
                    {isComplete ? (
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">🎉 Assignment Posted! You&apos;re ready to go.</p>
                            <p className="text-xs text-muted-foreground">View student submissions, grades, and class analytics by clicking the assignment.</p>
                            <p className="text-xs text-muted-foreground">Need Help? Check out our 1-minute <Link className='underline text-primary' href={`/classroom/${classId}/${teacherId}/teacher-guide`}>Teacher Guide Videos</Link></p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground mb-1">Next Step:</p>
                                <p className="text-sm font-semibold">{nextStep?.label}</p>
                                {navigationGuidance && (
                                    <div className="bg-accent/50 rounded-md mt-2">
                                        <p className="text-xs text-primary leading-tight">
                                            Hint: <span className="font-medium">{isMobile ? navigationGuidance.mobile : navigationGuidance.desktop}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {/* <OnboardingCard 
                    nextStep={nextStep}
                    classId={classId}
                    teacherId={teacherId}
                    isNewClass={isNewClass}
                /> */}

                <ProgressStep 
                    label={nextStep?.label || ''}
                    description={nextStep?.description || ''}
                    isCompleted={false}
                    actionUrl={nextStep ? nextStep.actionUrl(classId, teacherId) : '#'}
                    actionLabel={nextStep?.actionLabel || ''}
                    stepNumber={1}
                    isActive={true}
                
                />
            </div>
        </div>
    );
}
