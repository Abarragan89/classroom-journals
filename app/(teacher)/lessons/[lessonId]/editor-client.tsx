'use client';

import { useState, useTransition, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LessonStatus, SlideType } from '@prisma/client';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    ArrowLeft,
    Plus,
    GripVertical,
    Trash2,
    Save,
    Play,
    CheckSquare,
    FileUp,
} from 'lucide-react';
import SlideRichEditor from '@/components/lessons/slide-rich-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
    saveSlides,
    updateLesson,
    startLessonSession,
    SlideInput,
} from '@/lib/actions/lessons.action';

interface SlideWithCheckpoint {
    id: string;
    order: number;
    type: SlideType;
    content: { html: string; notes?: string; backgroundImage?: string };
    checkpoint: { id: string; question: string } | null;
}

interface LessonData {
    id: string;
    title: string;
    status: LessonStatus;
    slides: SlideWithCheckpoint[];
}

interface Classroom {
    id: string;
    name: string;
    period: string | null;
}

// ── Local slide representation (may have temp IDs before saving) ─────────────
interface LocalSlide {
    id: string; // "new-<n>" for unsaved slides
    order: number;
    type: SlideType;
    content: { html: string; notes?: string };
    checkpointQuestion: string;
}

let newIdCounter = 0;
function tempId() {
    return `new-${++newIdCounter}`;
}

function dbSlidesToLocal(slides: SlideWithCheckpoint[]): LocalSlide[] {
    return slides.map((s) => ({
        id: s.id,
        order: s.order,
        type: s.type,
        content: { html: (s.content as any).html ?? '', notes: (s.content as any).notes ?? '' },
        checkpointQuestion: s.checkpoint?.question ?? '',
    }));
}

// ── Sortable slide item in the left panel ─────────────────────────────────────
function SortableSlideItem({
    slide,
    index,
    isSelected,
    onSelect,
    onDelete,
}: {
    slide: LocalSlide;
    index: number;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: slide.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onSelect}
            className={`group flex items-center gap-1.5 px-2 py-2 rounded-md cursor-pointer select-none text-sm border ${isSelected
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-transparent hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
        >
            <button
                className="opacity-30 group-hover:opacity-60 cursor-grab touch-none shrink-0"
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                aria-label="Drag to reorder"
            >
                <GripVertical size={14} />
            </button>
            <span className="w-5 text-xs shrink-0 text-center">{index + 1}</span>
            <span className="flex-1 truncate">
                {slide.type === SlideType.CHECKPOINT
                    ? `✓ ${slide.checkpointQuestion || 'Checkpoint'}`
                    : slide.content.html.replace(/<[^>]+>/g, '').slice(0, 40) ||
                    'Empty slide'}
            </span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="opacity-0 group-hover:opacity-60 hover:opacity-100 text-destructive shrink-0"
                aria-label="Delete slide"
            >
                <Trash2 size={13} />
            </button>
        </div>
    );
}

// ── Main Editor ───────────────────────────────────────────────────────────────
export default function LessonEditorClient({
    lesson,
    classrooms,
}: {
    lesson: LessonData;
    classrooms: Classroom[];
}) {
    const router = useRouter();
    const [title, setTitle] = useState(lesson.title);
    const [slides, setSlides] = useState<LocalSlide[]>(
        dbSlidesToLocal(lesson.slides),
    );
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [presentDialogOpen, setPresentDialogOpen] = useState(false);
    const [selectedClassroomId, setSelectedClassroomId] = useState('');
    const [isPending, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const currentSlide = slides[selectedIdx] ?? null;

    // ── Handlers ────────────────────────────────────────────────────────────────
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setSlides((prev) => {
            const oldIdx = prev.findIndex((s) => s.id === active.id);
            const newIdx = prev.findIndex((s) => s.id === over.id);
            const reordered = arrayMove(prev, oldIdx, newIdx).map((s, i) => ({
                ...s,
                order: i,
            }));
            // Update selected index to follow the moved item
            setSelectedIdx(newIdx);
            return reordered;
        });
    }

    function addSlide(type: SlideType) {
        const newSlide: LocalSlide = {
            id: tempId(),
            order: slides.length,
            type,
            content: { html: type === SlideType.CONTENT ? '<h2>New Slide</h2><p></p>' : '' },
            checkpointQuestion: '',
        };
        setSlides((prev) => [...prev, newSlide]);
        setSelectedIdx(slides.length);
    }

    function deleteSlide(id: string) {
        setSlides((prev) => {
            const next = prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i }));
            setSelectedIdx((idx) => Math.min(idx, Math.max(0, next.length - 1)));
            return next;
        });
    }

    function updateCurrentSlide(patch: Partial<LocalSlide>) {
        if (!currentSlide) return;
        setSlides((prev) =>
            prev.map((s) => (s.id === currentSlide.id ? { ...s, ...patch } : s)),
        );
    }

    function handleSave() {
        startTransition(async () => {
            try {
                // Save title if changed
                if (title !== lesson.title) {
                    await updateLesson(lesson.id, { title });
                }

                const slideInputs: SlideInput[] = slides.map((s) => ({
                    id: s.id.startsWith('new-') ? undefined : s.id,
                    order: s.order,
                    type: s.type,
                    content: s.content,
                    ...(s.type === SlideType.CHECKPOINT && {
                        checkpoint: { question: s.checkpointQuestion },
                    }),
                }));

                await saveSlides(lesson.id, slideInputs);
                toast.success('Lesson saved');
                router.refresh();
            } catch {
                toast.error('Failed to save lesson');
            }
        });
    }

    function handleStartSession() {
        if (!selectedClassroomId) return;
        startTransition(async () => {
            try {
                // First save
                const slideInputs: SlideInput[] = slides.map((s) => ({
                    id: s.id.startsWith('new-') ? undefined : s.id,
                    order: s.order,
                    type: s.type,
                    content: s.content,
                    ...(s.type === SlideType.CHECKPOINT && {
                        checkpoint: { question: s.checkpointQuestion },
                    }),
                }));
                await saveSlides(lesson.id, slideInputs);
                await updateLesson(lesson.id, { status: LessonStatus.READY });

                const { id: sessionId } = await startLessonSession(
                    lesson.id,
                    selectedClassroomId,
                );
                setPresentDialogOpen(false);
                router.push(`/lessons/${lesson.id}/present?sessionId=${sessionId}`);
            } catch {
                toast.error('Failed to start session');
            }
        });
    }

    function handlePptxImport(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/lessons/import-pptx', {
                    method: 'POST',
                    body: formData,
                });
                if (!res.ok) throw new Error();
                const { slides: imported } = await res.json() as { slides: { html: string }[] };
                setSlides((prev) => [
                    ...prev,
                    ...imported.map((s: { html: string }, i: number) => ({
                        id: tempId(),
                        order: prev.length + i,
                        type: SlideType.CONTENT as SlideType,
                        content: { html: s.html },
                        checkpointQuestion: '',
                    })),
                ]);
                setSelectedIdx(slides.length);
                toast.success(`Imported ${imported.length} slides`);
            } catch {
                toast.error('Failed to import PPTX');
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        });
    }

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Top toolbar */}
            <div className="flex items-center gap-3 px-4 py-2 border-b bg-background shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/lessons')}
                >
                    <ArrowLeft size={16} className="mr-1.5" />
                    Back
                </Button>

                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="max-w-xs h-8 text-sm font-medium"
                />

                <div className="flex-1" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                    title="Import PPTX"
                >
                    <FileUp size={15} className="mr-1.5" />
                    Import PPTX
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pptx"
                    className="hidden"
                    onChange={handlePptxImport}
                />

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={isPending}
                >
                    <Save size={15} className="mr-1.5" />
                    Save
                </Button>

                <Button
                    size="sm"
                    onClick={() => setPresentDialogOpen(true)}
                    disabled={slides.length === 0 || isPending}
                >
                    <Play size={15} className="mr-1.5" />
                    Present
                </Button>
            </div>

            {/* Main area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left: slide list */}
                <aside className="w-52 shrink-0 border-r bg-muted/30 flex flex-col overflow-y-auto">
                    <div className="p-2 border-b flex gap-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 h-7 text-xs"
                            onClick={() => addSlide(SlideType.CONTENT)}
                        >
                            <Plus size={12} className="mr-1" />
                            Slide
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 h-7 text-xs"
                            onClick={() => addSlide(SlideType.CHECKPOINT)}
                            title="Add checkpoint question"
                        >
                            <CheckSquare size={12} className="mr-1" />
                            Check
                        </Button>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={slides.map((s) => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="p-2 flex flex-col gap-1">
                                {slides.map((slide, i) => (
                                    <SortableSlideItem
                                        key={slide.id}
                                        slide={slide}
                                        index={i}
                                        isSelected={i === selectedIdx}
                                        onSelect={() => setSelectedIdx(i)}
                                        onDelete={() => deleteSlide(slide.id)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {slides.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center px-3 py-4">
                            Add a slide to get started
                        </p>
                    )}
                </aside>

                {/* Center: editor */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {currentSlide ? (
                        <>
                            <div className="flex items-center gap-2 px-4 py-2 border-b shrink-0">
                                <Badge variant="outline" className="text-xs">
                                    Slide {selectedIdx + 1} of {slides.length}
                                </Badge>
                                <Badge
                                    variant={
                                        currentSlide.type === SlideType.CHECKPOINT
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    className="text-xs"
                                >
                                    {currentSlide.type === SlideType.CHECKPOINT
                                        ? 'Checkpoint'
                                        : 'Content'}
                                </Badge>
                            </div>

                            <div className="flex-1 overflow-auto p-4">
                                {currentSlide.type === SlideType.CHECKPOINT ? (
                                    <div className="max-w-2xl mx-auto space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium mb-1.5 block">
                                                Checkpoint Question
                                            </Label>
                                            <Textarea
                                                value={currentSlide.checkpointQuestion}
                                                onChange={(e) =>
                                                    updateCurrentSlide({
                                                        checkpointQuestion: e.target.value,
                                                    })
                                                }
                                                placeholder="Enter your question here..."
                                                className="resize-none min-h-[100px]"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Students will type a short answer. Responses are collected
                                            in real time during the lesson.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="max-w-3xl mx-auto space-y-4">
                                        <SlideRichEditor
                                            html={currentSlide.content.html}
                                            onChange={(html) =>
                                                updateCurrentSlide({
                                                    content: {
                                                        ...currentSlide.content,
                                                        html,
                                                    },
                                                })
                                            }
                                        />
                                        <div>
                                            <Label className="text-sm font-medium mb-1.5 block">
                                                Speaker Notes (optional)
                                            </Label>
                                            <Textarea
                                                value={currentSlide.content.notes ?? ''}
                                                onChange={(e) =>
                                                    updateCurrentSlide({
                                                        content: {
                                                            ...currentSlide.content,
                                                            notes: e.target.value,
                                                        },
                                                    })
                                                }
                                                placeholder="Notes visible only to you during presentation..."
                                                className="resize-none min-h-[80px] text-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
                            <p>No slides yet</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addSlide(SlideType.CONTENT)}
                            >
                                <Plus size={14} className="mr-1.5" />
                                Add first slide
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Present dialog */}
            <Dialog open={presentDialogOpen} onOpenChange={setPresentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Start Lesson Session</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Select which class to present this lesson to. Students in that class
                        will be able to follow along in real time.
                    </p>
                    <Select
                        value={selectedClassroomId}
                        onValueChange={setSelectedClassroomId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a class..." />
                        </SelectTrigger>
                        <SelectContent>
                            {classrooms.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                    {c.period ? ` — Period ${c.period}` : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleStartSession}
                            disabled={!selectedClassroomId || isPending}
                        >
                            <Play size={14} className="mr-1.5" />
                            Start Session
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
