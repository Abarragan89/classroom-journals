'use client';

import { JSX, useMemo, useRef } from 'react';
import { X, Sidebar, CheckCircle2, Circle } from 'lucide-react';
import { OnboardingState, calculateProgress, getNextStep, isOnboardingComplete } from '@/lib/onboarding-utils';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import confetti from 'canvas-confetti';

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
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Get the last segment of the URL path
    const currentPage = useMemo(() => {
        const segments = pathname?.split('/').filter(Boolean) || [];
        return segments[segments.length - 1] || '';
    }, [pathname]);

    const checklistStepItems = ['Add Class', 'Add Students', 'Create Jot', 'Assign Jot'];

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

    const handleFinishClick = () => {
        // Get button position for confetti origin
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;

            // Fire confetti burst from button
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { x, y },
                colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'],
                ticks: 200,
            });
        }

        // Dismiss after confetti animation
        setTimeout(() => {
            onDismiss();
        }, 500);
    };

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
            {/* Dismiss Button doesn't show up if items are complete */}
            {!isComplete && (
                <button
                    onClick={onDismiss}
                    className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-accent transition-colors group"
                    aria-label="Dismiss onboarding"
                >
                    <X className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                </button>
            )}
            {/* Header with Progress */}
            <div className="">
                <div className='flex-between'>
                    <h3 className="text-lg font-semibold ">
                        {isNewClass ? (
                            <>
                                <span className='mr-2'>🎉</span>
                                <span>Welcome to Your Class!</span>
                            </>
                        )
                            : 'Setup Progress'}
                    </h3>
                </div>
                <Progress value={progressPercent} className="h-1.5 mb-2 border muted bg-muted" />
            </div>
            <div className="flex gap-4">
                <div className='flex-1'>
                    {/* Next Step or Completion Message */}
                    {isComplete ? (
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">🎉 Assignment Posted! You&apos;re all set!.</p>
                            <p className="text-xs text-muted-foreground font-bold">These are your posted assignments. Click them to view details, grade, and provide feedback.</p>
                            <div className='flex-center my-7'>
                                <Button
                                    ref={buttonRef}
                                    onClick={handleFinishClick}
                                    className="shadow-sm"
                                    size={"sm"}
                                >
                                    Finished
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">Need Help? <Link className='underline text-primary' href={`/classroom/${classId}/${teacherId}/teacher-guide`}>Teacher Guide Videos</Link></p>
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
                {!isComplete && (
                    <div className='flex-1 text-sm space-y-1'>
                        {checklistStepItems.map((item, index) => {
                            const stepKey = Object.keys(completedSteps)[index];
                            const isChecked = completedSteps[stepKey as keyof OnboardingState];

                            return (
                                <div key={item} className="flex items-center gap-2 mb-1">
                                    <div>
                                        {isChecked ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                                        ) : (
                                            <Circle className="h-5 w-5 text-muted-foreground/50" />
                                        )}
                                    </div>
                                    <span className={cn('text-xs', isChecked ? 'line-through text-muted-foreground font-medium' : 'text-foreground font-bold')}>
                                        {item}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
