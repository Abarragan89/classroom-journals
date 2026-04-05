'use client';

import { useEffect, useState, useRef } from 'react';
import { SlideType } from '@prisma/client';
import { CheckCircle2, BookOpen, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { getSocket, disconnectSocket } from '@/lib/socket-client';
import { toast } from 'sonner';

interface SlideData {
    id: string;
    order: number;
    type: SlideType;
    content: { html: string; notes?: string };
    checkpoint: { id: string; question: string } | null;
}

interface LessonData {
    id: string;
    title: string;
    slides: SlideData[];
}

export default function StudentViewerClient({
    lesson,
    sessionId,
    studentId,
    studentName,
    initialSlideIndex,
}: {
    lesson: LessonData;
    sessionId: string;
    studentId: string;
    studentName: string;
    initialSlideIndex: number;
}) {
    const [currentIdx, setCurrentIdx] = useState(initialSlideIndex);
    const [isEnded, setIsEnded] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [checkpointAnswer, setCheckpointAnswer] = useState('');
    const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentSlide = lesson.slides[currentIdx];

    // ── Socket ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        const socket = getSocket();
        socket.connect();

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('lesson:student-join', {
                sessionId,
                studentId,
                name: studentName,
            });
        });

        socket.on('disconnect', () => setIsConnected(false));

        socket.on(
            'slide:sync',
            (data: { currentSlideIndex: number; currentFragmentIndex: number }) => {
                setCurrentIdx(data.currentSlideIndex);
                setCheckpointAnswer('');
            },
        );

        socket.on(
            'slide:update',
            (data: { slideIndex: number; fragmentIndex: number }) => {
                setCurrentIdx(data.slideIndex);
                setCheckpointAnswer('');
            },
        );

        socket.on('session:ended', () => {
            setIsEnded(true);
            disconnectSocket();
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('slide:sync');
            socket.off('slide:update');
            socket.off('session:ended');
            disconnectSocket();
        };
    }, [sessionId, studentId, studentName]);

    // ── Checkpoint submit ────────────────────────────────────────────────────────
    async function handleSubmitCheckpoint() {
        if (!currentSlide?.checkpoint || !checkpointAnswer.trim()) return;
        setIsSubmitting(true);

        try {
            const res = await fetch(
                `/api/lessons/sessions/${sessionId}/checkpoint-responses`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        checkpointId: currentSlide.checkpoint.id,
                        answer: checkpointAnswer.trim(),
                    }),
                },
            );

            if (!res.ok) throw new Error();

            // Notify teacher via socket
            const socket = getSocket();
            socket.emit('checkpoint:submit', {
                sessionId,
                checkpointId: currentSlide.checkpoint.id,
                studentId,
                answer: checkpointAnswer.trim(),
            });

            setSubmitted((prev) => ({
                ...prev,
                [currentSlide.checkpoint!.id]: true,
            }));
            toast.success('Response submitted!');
        } catch {
            toast.error('Failed to submit response');
        } finally {
            setIsSubmitting(false);
        }
    }

    // ── Ended state ──────────────────────────────────────────────────────────────
    if (isEnded) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
                <CheckCircle2 size={48} className="text-primary opacity-60" />
                <h2 className="text-xl font-semibold">Lesson Ended</h2>
                <p className="text-muted-foreground text-sm max-w-xs">
                    The teacher has ended this lesson session. Great work!
                </p>
            </div>
        );
    }

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0">
                <BookOpen size={18} className="text-primary" />
                <span className="font-semibold text-sm truncate">{lesson.title}</span>
                <div className="flex-1" />
                {!isConnected && (
                    <Badge variant="secondary" className="text-xs gap-1">
                        <WifiOff size={11} />
                        Reconnecting…
                    </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                    {currentIdx + 1} / {lesson.slides.length}
                </span>
            </div>

            {/* Slide content */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="max-w-3xl w-full">
                    {currentSlide?.type === SlideType.CHECKPOINT ? (
                        <div className="space-y-5">
                            <Badge className="text-sm px-3 py-1">Question</Badge>
                            <h2 className="text-xl font-semibold">
                                {currentSlide.checkpoint?.question}
                            </h2>

                            {submitted[currentSlide.checkpoint?.id ?? ''] ? (
                                <div className="flex items-center gap-2 text-primary text-sm">
                                    <CheckCircle2 size={18} />
                                    Response submitted
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Textarea
                                        value={checkpointAnswer}
                                        onChange={(e) => setCheckpointAnswer(e.target.value)}
                                        placeholder="Type your answer..."
                                        className="min-h-[100px] resize-none"
                                    />
                                    <Button
                                        onClick={handleSubmitCheckpoint}
                                        disabled={!checkpointAnswer.trim() || isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting…' : 'Submit'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            className="prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{
                                __html: currentSlide?.content?.html ?? '',
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Waiting indicator */}
            {isConnected && (
                <div className="px-4 py-3 border-t text-center">
                    <p className="text-xs text-muted-foreground">
                        Following along with your teacher
                    </p>
                </div>
            )}
        </div>
    );
}
