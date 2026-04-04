'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface StudentInfo {
  id: string;
  name: string | null;
  username: string | null;
}

interface CheckpointInfo {
  question: string;
  slideId: string;
}

interface Response {
  id: string;
  answer: string;
  submittedAt: Date;
  student: StudentInfo;
  checkpoint: CheckpointInfo;
  checkpointId: string;
}

interface LessonSessionData {
  id: string;
  startedAt: Date;
  endedAt: Date | null;
  lesson: { id: string; title: string };
  responses: Response[];
}

function formatDuration(start: Date, end: Date | null) {
  if (!end) return '—';
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

export default function SessionReportClient({
  lessonSession,
  studentCount,
}: {
  lessonSession: LessonSessionData;
  studentCount: number;
}) {
  const router = useRouter();

  // Group responses by checkpoint
  const byCheckpoint = lessonSession.responses.reduce<
    Record<string, { question: string; responses: Response[] }>
  >((acc, r) => {
    if (!acc[r.checkpointId]) {
      acc[r.checkpointId] = {
        question: r.checkpoint.question,
        responses: [],
      };
    }
    acc[r.checkpointId].responses.push(r);
    return acc;
  }, {});

  const checkpointIds = Object.keys(byCheckpoint);
  const uniqueResponders = new Set(lessonSession.responses.map((r) => r.student.id)).size;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/lessons')}
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Lessons
        </Button>
        <h1 className="text-xl font-semibold truncate">
          {lessonSession.lesson.title} — Session Report
        </h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center gap-1.5">
              <Clock size={15} className="text-muted-foreground" />
              <span className="text-lg font-semibold">
                {formatDuration(lessonSession.startedAt, lessonSession.endedAt)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Students
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center gap-1.5">
              <Users size={15} className="text-muted-foreground" />
              <span className="text-lg font-semibold">{studentCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Responded
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <span className="text-lg font-semibold">{uniqueResponders}</span>
            <span className="text-sm text-muted-foreground"> / {studentCount}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Checkpoints
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center gap-1.5">
              <MessageSquare size={15} className="text-muted-foreground" />
              <span className="text-lg font-semibold">{checkpointIds.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checkpoint responses */}
      {checkpointIds.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-base font-semibold">Checkpoint Responses</h2>
          <Accordion type="multiple" className="space-y-2">
            {checkpointIds.map((cpId, i) => {
              const cp = byCheckpoint[cpId];
              return (
                <AccordionItem
                  key={cpId}
                  value={cpId}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="text-sm py-3 hover:no-underline">
                    <div className="flex items-center gap-2 text-left">
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Q{i + 1}
                      </Badge>
                      <span>{cp.question}</span>
                      <Badge variant="outline" className="text-xs ml-auto shrink-0">
                        {cp.responses.length} response
                        {cp.responses.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pb-3">
                      {cp.responses.map((r) => (
                        <div
                          key={r.id}
                          className="flex gap-3 p-3 rounded-md bg-muted/50 text-sm"
                        >
                          <span className="font-medium shrink-0 text-primary">
                            {r.student.name ?? r.student.username ?? 'Student'}
                          </span>
                          <span className="text-muted-foreground flex-1">
                            {r.answer}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {new Date(r.submittedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          No checkpoint responses were collected during this session.
        </p>
      )}
    </main>
  );
}
