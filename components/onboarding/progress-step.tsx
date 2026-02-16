'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';

type ProgressStepProps = {
    label: string;
    description: string;
    isCompleted: boolean;
    actionUrl: string;
    actionLabel: string;
    stepNumber: number;
    isActive?: boolean;
};

export default function ProgressStep({
    label,
    description,
    isCompleted,
    actionUrl,
    actionLabel,
    stepNumber,
    isActive = false,
}: ProgressStepProps) {
    const [showCheckmark, setShowCheckmark] = useState(isCompleted);

    // Trigger animation when completed state changes
    if (isCompleted && !showCheckmark) {
        setTimeout(() => setShowCheckmark(true), 100);
    }

    return (
        <Link
            href={actionUrl}
            className={cn(
                'group flex items-start gap-3 p-3 rounded-lg transition-all duration-200',
                'hover:bg-accent/50 border border-transparent',
                isActive && 'bg-accent/30 border-primary/20',
                !isCompleted && 'hover:border-primary/30'
            )}
        >
            {/* Step Icon */}
            <div className="flex-shrink-0 mt-0.5">
                {isCompleted ? (
                    <CheckCircle2
                        className={cn(
                            'h-5 w-5 text-green-600 dark:text-green-500 transition-all duration-300',
                            showCheckmark && 'scale-110'
                        )}
                    />
                ) : (
                    <div className="relative">
                        <Circle className="h-5 w-5 text-muted-foreground/50" />
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                            {stepNumber}
                        </span>
                    </div>
                )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4
                        className={cn(
                            'text-sm font-semibold transition-colors',
                            isCompleted ? 'text-foreground/80 line-through' : 'text-foreground'
                        )}
                    >
                        {label}
                    </h4>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{description}</p>
                {!isCompleted && (
                    <span className="text-xs font-medium text-primary group-hover:underline">
                        {actionLabel} →
                    </span>
                )}
            </div>
        </Link>
    );
}
