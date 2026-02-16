'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Sparkles, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { OnboardingStepInfo } from '@/lib/onboarding-utils';
import { cn } from '@/lib/utils';

type OnboardingCardProps = {
    nextStep: OnboardingStepInfo | null;
    classId: string;
    teacherId: string;
    onDismiss: () => void;
    isNewClass?: boolean;
};

export default function OnboardingCard({
    nextStep,
    classId,
    teacherId,
    onDismiss,
    isNewClass = false,
}: OnboardingCardProps) {
    const [isVisible, setIsVisible] = useState(true);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for animation
    };

    if (!nextStep) return null;

    return (
        <Card
            className={cn(
                'relative border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent shadow-lg transition-all duration-300',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            )}
        >
            {/* Dismiss Button */}
            <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-accent transition-colors"
                aria-label="Dismiss onboarding"
            >
                <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-xl">
                            {isNewClass ? '🎉 Congratulations on Creating Your Class!' : 'Continue Your Setup'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {isNewClass
                                ? "You're just a few steps away from getting started with your students."
                                : "Let's complete your classroom setup."}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
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

                {/* Optional: Progress Hint */}
                <p className="text-xs text-muted-foreground text-center">
                    You can dismiss this message, but it will reappear until setup is complete.
                </p>
            </CardContent>
        </Card>
    );
}
