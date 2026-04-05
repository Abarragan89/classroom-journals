'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LessonStatus } from '@prisma/client';
import { BookOpen, Plus, Trash2, Pencil, Play, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { createLesson, deleteLesson } from '@/lib/actions/lessons.action';
import { toast } from 'sonner';

interface LessonSummary {
    id: string;
    title: string;
    status: LessonStatus;
    createdAt: Date;
    updatedAt: Date;
    _count: { slides: number };
}

const STATUS_BADGE: Record<
    LessonStatus,
    { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
    DRAFT: { label: 'Draft', variant: 'secondary' },
    READY: { label: 'Ready', variant: 'outline' },
    ACTIVE: { label: 'Active', variant: 'default' },
    COMPLETED: { label: 'Completed', variant: 'outline' },
};

export default function LessonsLibraryClient({
    lessons: initial,
}: {
    lessons: LessonSummary[];
}) {
    const router = useRouter();
    const [lessons, setLessons] = useState(initial);
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [isPending, startTransition] = useTransition();

    function handleCreate() {
        if (!title.trim()) return;
        startTransition(async () => {
            try {
                const lesson = await createLesson(title.trim());
                setCreateOpen(false);
                setTitle('');
                router.push(`/lessons/${lesson.id}`);
            } catch {
                toast.error('Failed to create lesson');
            }
        });
    }

    function handleDelete(id: string) {
        startTransition(async () => {
            try {
                await deleteLesson(id);
                setLessons((prev) => prev.filter((l) => l.id !== id));
                setDeleteId(null);
                toast.success('Lesson deleted');
            } catch {
                toast.error('Failed to delete lesson');
            }
        });
    }

    return (
        <main className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <BookOpen size={24} className="text-primary" />
                    <h1 className="text-2xl font-semibold">Lessons</h1>
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus size={16} className="mr-2" />
                    New Lesson
                </Button>
            </div>

            {lessons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
                    <BookOpen size={48} className="opacity-20" />
                    <p className="text-lg">No lessons yet</p>
                    <Button variant="outline" onClick={() => setCreateOpen(true)}>
                        <Plus size={16} className="mr-2" />
                        Create your first lesson
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lessons.map((lesson) => {
                        const badge = STATUS_BADGE[lesson.status];
                        return (
                            <Card key={lesson.id} className="flex flex-col justify-between">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="text-base line-clamp-2">
                                            {lesson.title}
                                        </CardTitle>
                                        <Badge variant={badge.variant} className="shrink-0 text-xs">
                                            {badge.label}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground pb-2">
                                    {lesson._count.slides} slide
                                    {lesson._count.slides !== 1 ? 's' : ''}
                                    <span className="mx-1.5">·</span>
                                    Updated {new Date(lesson.updatedAt).toLocaleDateString()}
                                </CardContent>
                                <CardFooter className="flex gap-2 pt-0">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => router.push(`/lessons/${lesson.id}`)}
                                    >
                                        <Pencil size={14} className="mr-1.5" />
                                        Edit
                                    </Button>
                                    {lesson.status === LessonStatus.READY ||
                                        lesson.status === LessonStatus.ACTIVE ? (
                                        <Button
                                            size="sm"
                                            variant="default"
                                            onClick={() =>
                                                router.push(`/lessons/${lesson.id}/present`)
                                            }
                                        >
                                            <Play size={14} className="mr-1.5" />
                                            Present
                                        </Button>
                                    ) : null}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => setDeleteId(lesson.id)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Create dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Lesson</DialogTitle>
                    </DialogHeader>
                    <Input
                        placeholder="Lesson title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        autoFocus
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleCreate} disabled={!title.trim() || isPending}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <Dialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Lesson</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        This will permanently delete the lesson and all its slides and
                        session data. This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            disabled={isPending}
                            onClick={() => deleteId && handleDelete(deleteId)}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
