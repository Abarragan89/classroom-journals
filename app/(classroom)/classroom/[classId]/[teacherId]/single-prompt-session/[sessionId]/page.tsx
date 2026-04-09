import { User } from "@/types";
import { PromptSession } from "@/types";
import { getAllStudents } from "@/lib/server/classroom";
import SessionSettingsCard from "@/components/shared/session-settings-card";
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
            <h2 className="h2-bold font-medium line-clamp-3 my-5">{promptSession?.title}</h2>
            <SessionSettingsCard
                promptSessionType={promptSession?.promptType}
                promptSessionId={promptSession?.id}
                initialStatus={promptSession?.status}
                initialPublicStatus={promptSession?.isPublic}
                initialGradesVisible={promptSession?.areGradesVisible}
                classId={classId}
                teacherId={teacherId}
                sessionId={sessionId}
            />
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

