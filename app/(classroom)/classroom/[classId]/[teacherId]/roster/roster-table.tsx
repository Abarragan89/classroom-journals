"use client";
import PringLoginBtn from "@/components/buttons/print-login";
import AddStudentBtn from "@/components/forms/roster-forms/add-student-button";
import StudentRosterRow from "@/components/shared/student-roster-row";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Session, User } from "@/types";
import { useQuery } from "@tanstack/react-query";
import PrintViewLogins from "./print-view-logins";
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import { Separator } from "@/components/ui/separator";

export default function RosterTable({ studentRoster, session, classId, classCode }: {
    studentRoster: User[],
    session: Session,
    classId: string,
    classCode: string
}) {

    const { data: allStudents } = useQuery({
        queryKey: ['getStudentRoster', classId],
        queryFn: async () => {
            const response = await fetch(`/api/classroom?classId=${classId}&teacherId=${session.user.id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch student roster');
            }
            const { students } = await response.json();
            return students as User[];
        },
        initialData: studentRoster,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })


    return (
        <>
            {/* Only visible in print view */}
            <PrintViewLogins
                classCode={classCode}
                studentRoster={allStudents}
            />
            <div className="flex-between w-full absolute top-[50px] right-0 print:hidden">
                {allStudents && allStudents?.length > 0 && <PringLoginBtn />}
                {/* Show add student button in different position if there are students */}
                <div className={`${allStudents && allStudents?.length > 0 ? '' : 'mt-40 flex-center scale-105 w-full'}`}>
                    <AddStudentBtn classId={classId} session={session} />
                </div>
            </div>


            {allStudents && allStudents.length === 0 ? (
                <div className="max-w-xl mx-auto mt-10">
                    <div className="bg-card border shadow-sm rounded-lg p-8 pb-20 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Your roster is empty!</h2>
                        <p className="text-muted-foreground mb-5 text-base sm:text-lg">
                            Start adding students to your roster.
                        </p>
                    </div>
                    <Separator className="my-10" />
                    <div>
                        <p className="text-center">Learn about Rosters in a <span className="font-bold">25 seconds</span> video!</p>
                        <LiteYouTubeEmbed
                            id="PE9eAIZyfII"
                            title={`JotterBlog Tutorial - Rosters`}
                        />
                    </div>
                </div>
            ) : (

                <div className="border rounded-md mt-20 print:hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Password</TableHead>
                                <TableHead className="text-right">&nbsp;</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <StudentRosterRow
                                studentRoster={allStudents}
                                session={session}
                                classId={classId}
                            />
                        </TableBody>
                    </Table>
                </div>
            )}
        </>
    )
}
