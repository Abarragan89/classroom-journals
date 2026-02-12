'use client'
import { useRef, useEffect } from 'react';
import { ArrowBigLeftIcon, ArrowLeft, Sidebar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

export default function JotTutorialArrow({
    onDismiss,
}: {
    onDismiss: () => void,
    classId: string,
    teacherId: string
}) {
    const hasDismissed = useRef(false);
    const isMobile = useIsMobile();

    // Prevent scrolling while tutorial is showing
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const handleDismiss = () => {
        if (hasDismissed.current) return;
        hasDismissed.current = true;
        onDismiss();
    };

    // Mobile: Show banner at top
    if (isMobile) {
        return (
            <div className="fixed inset-0 z-50 print:hidden bg-black/60 pointer-events-none">
                {/* Spotlight circle to highlight the menu icon */}
                <div className="absolute top-[8px] left-[5px] w-10 h-10 rounded-full bg-white/20 animate-pulse pointer-events-none" />

                <div className="absolute flex top-[81px] left-[35px] right-0 z-50 px-4 print:hidden">
                    <ArrowBigLeftIcon className="h-8 w-8 text-primary my-2 animate-[pulse-y_1.5s_ease-in-out_infinite]" />
                    <style jsx>{`
                    @keyframes pulse-y {
                        0%, 100% {
                            transform: translateX(0px);
                        }
                        50% {
                            transform: translateX(-8px);
                        }
                    }
                `}</style>
                    <div className="bg-primary text-primary-foreground p-4 pr-10 rounded-lg shadow-lg relative pointer-events-auto">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <p className="font-semibold text-sm mb-1">Next Step: Create Your First Jot!</p>
                                <p className="text-xs opacity-90">Tap the <Sidebar className='inline h-4 w-4' /> menu icon and tap &quot;Jots&quot;</p>
                                <Button
                                    asChild
                                    size="sm"
                                    variant="secondary"
                                    className="w-full"
                                    onClick={handleDismiss}
                                >
                                </Button>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-primary-foreground/20 flex-shrink-0 absolute top-1 right-1"
                                onClick={handleDismiss}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Desktop: Show arrow pointing to sidebar
    return (
        <div className="fixed top-[162px] left-[120px] z-50 pointer-events-none print:hidden">
            <div className="relative  pointer-events-auto">
                <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
                    <div className="flex flex-col">
                        <p className="font-semibold text-sm">Roster Ready? Step 3: Create a Jot!</p>
                        <p className="text-xs opacity-90">Click &quot;Jots&quot; in the sidebar to make your first assignment</p>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
                        onClick={handleDismiss}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full">
                    <ArrowLeft
                        className="h-6 w-6 text-primary mr-2 animate-[pulse-x_1.5s_ease-in-out_infinite]"
                    // style={{
                    //     animation: 'pulse-x 1.5s ease-in-out infinite'
                    // }}
                    />
                    <style jsx>{`
                        @keyframes pulse-x {
                            0%, 100% {
                                transform: translateX(0px);
                            }
                            50% {
                                transform: translateX(-8px);
                            }
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
}
