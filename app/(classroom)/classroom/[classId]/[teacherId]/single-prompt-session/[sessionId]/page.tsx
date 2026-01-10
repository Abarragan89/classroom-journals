import { User } from "@/types";
import { PromptSession } from "@/types";
import { getAllStudents } from "@/lib/server/classroom";
import EditPromptSessionPopUp from "@/components/modalBtns/edit-prompt-session-popup";
import { getSinglePromptSessionTeacherDashboard } from "@/lib/server/prompt-sessions";
import MainClientWrapper from "./main-client-wrapper";

export default async function SinglePromptSession({
    params
}: {
    params: Promise<{ classId: string, teacherId: string, sessionId: string }>
}) {

    const { sessionId, classId, teacherId } = await params;

    if (!sessionId) {
        return <div>No session ID provided</div>;
    }

    const [promptSession, classRoster] = await Promise.all([
        getSinglePromptSessionTeacherDashboard(sessionId, teacherId) as unknown as PromptSession,
        getAllStudents(classId, teacherId) as unknown as User[]
    ]);

    if (!promptSession) {
        return <div>Prompt session not found</div>;
    }

    return (
        <div>
            <h2 className="text-xl lg:text-2xl line-clamp-3 mt-5">{promptSession?.prompt?.title}</h2>
            <div className="flex-between items-center mt-3">
                <EditPromptSessionPopUp
                    promptSessionType={promptSession?.promptType}
                    promptSessionId={promptSession?.id}
                    initialStatus={promptSession?.status}
                    initialPublicStatus={promptSession?.isPublic}
                    classId={classId}
                    teacherId={teacherId}
                    sessionId={sessionId}
                />

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

