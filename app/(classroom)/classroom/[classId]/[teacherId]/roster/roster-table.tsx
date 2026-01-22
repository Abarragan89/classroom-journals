"use client";
import PringLoginBtn from "@/components/buttons/print-login";
import AddStudentBtn from "@/components/forms/roster-forms/add-student-button";
import StudentRosterRow from "@/components/shared/student-roster-row";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Session, User } from "@/types";
import { useQuery } from "@tanstack/react-query";

export default function RosterTable({ studentRoster, session, classId }: {
    studentRoster: User[],
    session: Session,
    classId: string
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
            <div className="flex-between w-full absolute top-[50px] right-0 z-50">
                {allStudents && allStudents?.length > 0 && <PringLoginBtn />}

                {/* Show add student button in different position if there are students */}
                <div className={`${allStudents && allStudents?.length > 0 ? '' : 'mt-20 flex-center scale-125 w-full'}`}>
                    <AddStudentBtn classId={classId} session={session} />
                </div>
            </div>
            {allStudents && allStudents.length === 0 ? (
                <p className="mt-12 text-xl font-medium text-center">
                    Add students to the roster!
                </p>
            ) : (

                <div className="border rounded-md mt-20">
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
