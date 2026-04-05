'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SlideType } from '@prisma/client';
import {
    ChevronLeft,
    ChevronRight,
    X,
    Users,
    MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSocket, disconnectSocket } from '@/lib/socket-client';
import { endLessonSession } from '@/lib/actions/lessons.action';
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

interface CheckpointEntry {
    studentId: string;
    count: number;
}

export default function PresenterClient({
    lesson,
    sessionId,
    classroomId,
}: {
    lesson: LessonData;
    sessionId: string;
    classroomId: string;
}) {
    const router = useRouter();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [studentCount, setStudentCount] = useState(0);
    const [responses, setResponses] = useState<CheckpointEntry[]>([]);
    const [responseCount, setResponseCount] = useState(0);
    const [endPending, setEndPending] = useState(false);

    const currentSlide = lesson.slides[currentIdx];

    // ── Socket ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        const socket = getSocket();
        socket.connect();

        socket.emit('lesson:teacher-join', { sessionId });

        socket.on(
            'session:state',
            (state: { currentSlideIndex: number; studentCount: number }) => {
                setCurrentIdx(state.currentSlideIndex);
                setStudentCount(state.studentCount);
            },
        );

        socket.on('student:joined', ({ studentCount: count }: { studentCount: number }) => {
            setStudentCount(count);
        });

        socket.on(
            'checkpoint:new-response',
            ({ checkpointId }: { checkpointId: string }) => {
                setResponseCount((c) => c + 1);
            },
        );

        return () => {
            socket.off('session:state');
            socket.off('student:joined');
            socket.off('checkpoint:new-response');
            disconnectSocket();
        };
    }, [sessionId]);

    // ── Navigate ────────────────────────────────────────────────────────────────
    const navigate = useCallback(
        (idx: number) => {
            if (idx < 0 || idx >= lesson.slides.length) return;
            setCurrentIdx(idx);
            setResponseCount(0);

            const socket = getSocket();
            socket.emit('lesson:navigate', {
                sessionId,
                slideIndex: idx,
                fragmentIndex: -1,
            });

            // Persist to DB
            fetch(`/api/lessons/sessions/${sessionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentSlideIndex: idx, currentFragmentIndex: -1 }),
            }).catch(() => { });
        },
        [lesson.slides.length, sessionId],
    );

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigate(currentIdx + 1);
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') navigate(currentIdx - 1);
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [currentIdx, navigate]);

    async function handleEnd() {
        setEndPending(true);
        try {
            const socket = getSocket();
            socket.emit('lesson:end', { sessionId });
            await endLessonSession(sessionId);
            disconnectSocket();
            router.push(`/lessons/${lesson.id}/report?sessionId=${sessionId}`);
        } catch {
            toast.error('Failed to end session');
            setEndPending(false);
        }
    }

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Control bar */}
            <div className="flex items-center gap-3 px-4 py-2 border-b bg-background shrink-0">
                <span className="font-semibold text-sm truncate max-w-xs">{lesson.title}</span>

                <Badge variant="secondary" className="text-xs">
                    <Users size={11} className="mr-1" />
                    {studentCount} student{studentCount !== 1 ? 's' : ''}
                </Badge>

                <span className="text-xs text-muted-foreground">
                    Slide {currentIdx + 1} / {lesson.slides.length}
                </span>

                <div className="flex-1" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(currentIdx - 1)}
                    disabled={currentIdx === 0}
                >
                    <ChevronLeft size={16} />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(currentIdx + 1)}
                    disabled={currentIdx >= lesson.slides.length - 1}
                >
                    <ChevronRight size={16} />
                </Button>

                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleEnd}
                    disabled={endPending}
                >
                    <X size={14} className="mr-1.5" />
                    End Session
                </Button>
            </div>

            {/* Slide area */}
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex items-center justify-center p-8">
                    {currentSlide?.type === SlideType.CHECKPOINT ? (
                        <div className="max-w-2xl w-full text-center space-y-4">
                            <Badge className="text-sm px-3 py-1">Checkpoint Question</Badge>
                            <h2 className="text-2xl font-semibold">
                                {currentSlide.checkpoint?.question}
                            </h2>
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <MessageSquare size={16} />
                                <span className="text-sm">
                                    {responseCount} response{responseCount !== 1 ? 's' : ''} received
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="prose prose-lg dark:prose-invert max-w-4xl w-full"
                            dangerouslySetInnerHTML={{ __html: currentSlide?.content?.html ?? '' }}
                        />
                    )}
                </div>

                {/* Speaker notes */}
                {currentSlide?.content?.notes && (
                    <aside className="w-64 shrink-0 border-l p-4 text-sm text-muted-foreground overflow-y-auto">
                        <p className="font-semibold text-foreground mb-2 text-xs uppercase tracking-wide">
                            Notes
                        </p>
                        <p className="whitespace-pre-wrap">{currentSlide.content.notes}</p>
                    </aside>
                )}
            </div>

            {/* Slide thumbnails bottom bar */}
            <div className="flex gap-1.5 px-4 py-2 border-t bg-muted/30 overflow-x-auto shrink-0">
                {lesson.slides.map((slide, i) => (
                    <button
                        key={slide.id}
                        onClick={() => navigate(i)}
                        className={`shrink-0 w-14 h-9 rounded border text-xs font-medium transition-colors ${i === currentIdx
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background hover:bg-accent'
                            }`}
                    >
                        {slide.type === SlideType.CHECKPOINT ? '✓' : i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}
