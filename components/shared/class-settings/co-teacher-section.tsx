'use client';
import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { findTeacherByEmailAction, addCoTeacher, removeCoTeacher } from '@/lib/actions/classroom.actions';
import { toast } from 'sonner';
import { X, UserPlus, Search } from 'lucide-react';

type CoTeacher = {
    id: string;
    name: string | null;
    username: string | null;
    email: string | null;
};

export default function CoTeacherSection({
    classId,
    initialCoTeachers,
}: {
    classId: string;
    initialCoTeachers: CoTeacher[];
}) {
    const [email, setEmail] = useState('');
    const [foundTeacher, setFoundTeacher] = useState<CoTeacher | null>(null);
    const [coTeachers, setCoTeachers] = useState<CoTeacher[]>(initialCoTeachers);
    const [error, setError] = useState('');
    const [isFinding, startFinding] = useTransition();
    const [isAdding, startAdding] = useTransition();
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [isRemoving, startRemoving] = useTransition();

    function handleFind() {
        if (!email.trim()) return;
        setError('');
        setFoundTeacher(null);
        startFinding(async () => {
            const result = await findTeacherByEmailAction(classId, email.trim());
            if (result.success && result.data) {
                setFoundTeacher(result.data);
            } else {
                setError(result.message ?? 'Something went wrong.');
            }
        });
    }

    function handleAdd() {
        if (!foundTeacher) return;
        startAdding(async () => {
            const result = await addCoTeacher(classId, email.trim());
            if (result.success && result.data) {
                setCoTeachers(prev => [...prev, result.data as CoTeacher]);
                setFoundTeacher(null);
                setEmail('');
                toast.success('Co-Teacher Added!');
            } else {
                setError(result.message ?? 'Something went wrong.');
            }
        });
    }

    function handleRemove(coTeacherId: string) {
        setRemovingId(coTeacherId);
        startRemoving(async () => {
            const result = await removeCoTeacher(classId, coTeacherId);
            if (result.success) {
                setCoTeachers(prev => prev.filter(t => t.id !== coTeacherId));
            }
            setRemovingId(null);
        });
    }

    return (
        <div className="mt-8">
            <Separator className="mb-6" />
            <h3 className="text-lg font-semibold mb-1">Co-Teachers</h3>
            <p className="text-sm text-muted-foreground mb-4">
                Add another teacher by their account email. Co-teachers can access all class content but cannot edit class settings.
            </p>

            {/* Search row */}
            <div className="flex gap-2 mb-2">
                <Input
                    type="email"
                    placeholder="teacher@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); setFoundTeacher(null); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleFind(); } }}
                    disabled={isFinding}
                    className="max-w-sm"
                />
                <Button
                    onClick={handleFind}
                    disabled={isFinding || !email.trim()}
                    size="sm"
                    variant="outline"
                >
                    <Search size={16} className="mr-1" />
                    {isFinding ? 'Searching...' : 'Find'}
                </Button>
            </div>

            {error && <p className="text-sm text-destructive mb-3">{error}</p>}

            {/* Found teacher card */}
            {foundTeacher && (
                <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm max-w-sm mb-4 bg-accent/40">
                    <div>
                        <p className="font-medium">{foundTeacher.username ?? foundTeacher.name ?? 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{foundTeacher.email}</p>
                    </div>
                    <Button
                        size="sm"
                        disabled={isAdding}
                        onClick={handleAdd}
                    >
                        <UserPlus size={14} className="mr-1" />
                        {isAdding ? 'Adding...' : 'Add'}
                    </Button>
                </div>
            )}

            {/* Current co-teachers list */}
            {coTeachers.length > 0 && (
                <ul className="mt-2 space-y-2">
                    {coTeachers.map((teacher) => (
                        <li key={teacher.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm max-w-sm">
                            <div>
                                <p className="font-medium">{teacher.username ?? teacher.name ?? 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">{teacher.email}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                                disabled={removingId === teacher.id || isRemoving}
                                onClick={() => handleRemove(teacher.id)}
                                aria-label={`Remove ${teacher.username ?? teacher.name}`}
                            >
                                <X size={14} />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            {coTeachers.length === 0 && !foundTeacher && (
                <p className="text-sm text-muted-foreground mt-2">No co-teachers added yet.</p>
            )}
        </div>
    );
}
