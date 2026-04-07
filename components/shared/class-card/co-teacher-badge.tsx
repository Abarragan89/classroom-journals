'use client';
import { useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { removeCoTeacher } from '@/lib/actions/classroom.actions';
import { ResponsiveDialog } from '@/components/responsive-dialog';

export default function CoTeacherBadge({
    classId,
    teacherId,
}: {
    classId: string;
    teacherId: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const queryClient = useQueryClient();

    function handleLeave() {
        startTransition(async () => {
            const result = await removeCoTeacher(classId, teacherId);
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['teacherClassrooms', teacherId] });
                setIsOpen(false);
                router.refresh();
            }
        });
    }

    return (
        <>
            <div className="absolute top-3 right-3 z-10">
                <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors text-xs"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsOpen(true);
                    }}
                >
                    Co-Teacher
                </Badge>
            </div>

            <ResponsiveDialog
                title="Leave Class"
                description="Are you sure you want to leave this class? You will lose access immediately."
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                showDescription={true}
            >
                <div className="flex gap-3 justify-end mt-4">
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleLeave}
                        disabled={isPending}
                    >
                        {isPending ? 'Leaving...' : 'Leave Class'}
                    </Button>
                </div>
            </ResponsiveDialog>
        </>
    );
}
