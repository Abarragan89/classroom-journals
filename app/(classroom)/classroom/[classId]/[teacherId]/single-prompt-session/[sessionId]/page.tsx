import { User } from "@/types";
import { PromptSession } from "@/types";
import { getAllStudents } from "@/lib/actions/classroom.actions";
import EditPromptSessionPopUp from "@/components/modalBtns/edit-prompt-session-popup";
import { getSinglePromptSessionTeacherDashboard } from '@/lib/actions/prompt.session.actions';
import MainClientWrapper from "./main-client-wrapper";
import { Monitor } from "lucide-react";
import Link from "next/link";

export default async function SinglePromptSession({
    params
}: {
    params: Promise<{ classId: string, teacherId: string, sessionId: string }>
}) {

    const { sessionId, classId, teacherId } = await params;

    if (!sessionId) {
        return <div>No session ID provided</div>;
    }

    const promptSession = await getSinglePromptSessionTeacherDashboard(sessionId) as unknown as PromptSession

    if (!promptSession) {
        return <div>Prompt session not found</div>;
    }

    const classRoster = await getAllStudents(classId) as User[]


    return (
        <div>
            <h2 className="text-xl lg:text-2xl line-clamp-3 mt-5">{promptSession?.prompt?.title}</h2>

            <div className="flex-end items-center">
                <EditPromptSessionPopUp
                    promptSessionType={promptSession?.promptType}
                    promptSessionId={promptSession?.id}
                    initialStatus={promptSession?.status}
                    initialPublicStatus={promptSession?.isPublic}
                /> 
                    <Link 
                    className="ml-6"
                    href={`/classroom/${classId}/${teacherId}/single-prompt-session/${sessionId}/review-assessment-questions`}>
                        <Monitor
                            className='hover:cursor-pointer hover:text-accent'
                        />
                    </Link>
            </div>
            <MainClientWrapper
                promptSession={promptSession}
                classId={classId}
                teacherId={teacherId}
                classRoster={classRoster}
                sessionId={sessionId}
            />
        </div>
    );
}

