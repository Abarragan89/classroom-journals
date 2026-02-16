'use client';

import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { OnboardingStepInfo } from '@/lib/onboarding-utils';

type OnboardingCardProps = {
    nextStep: OnboardingStepInfo | null;
    classId: string;
    teacherId: string;
    isNewClass?: boolean;
};

export default function OnboardingCard({
    nextStep,
    classId,
    teacherId,
    isNewClass = false,
}: OnboardingCardProps) {

    if (!nextStep) return null;

    return (
        <>
            {/* <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                    {isNewClass
                        ? "You're just a few steps away from getting started with your students."
                        : "Let's complete your classroom setup."}
                </div>
            </div> */}
            {/* Next Action */}
            <div className="p-4 bg-card border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-2">Next Step:</p>
                <h4 className="text-base font-semibold mb-1">{nextStep.label}</h4>
                <p className="text-sm text-muted-foreground mb-3">{nextStep.description}</p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3">
                    <Button asChild size="sm" className="font-semibold">
                        <Link href={nextStep.actionUrl(classId, teacherId)}>
                            {nextStep.actionLabel}
                        </Link>
                    </Button>

                    {/* Optional: Demo Video Link */}
                    <Button asChild variant="ghost" size="sm" className="text-xs gap-1.5">
                        <a
                            href="https://www.youtube.com/watch?v=IZ9b6dTi56M"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <PlayCircle className="h-3.5 w-3.5" />
                            Watch 25-sec demo
                        </a>
                    </Button>
                </div>
            </div>
        </>
    );
}
