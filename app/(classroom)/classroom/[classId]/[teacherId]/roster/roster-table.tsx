"use client";
import PringLoginBtn from "@/components/buttons/print-login";
import AddStudentBtn from "@/components/forms/roster-forms/add-student-button";
import AddStudentForm from "@/components/forms/roster-forms/add-student-button/add-student-form";
import AddGoogleStudents from "@/components/forms/roster-forms/add-student-button/add-google-students";
import StudentRosterRow from "@/components/shared/student-roster-row";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GoogleClassroom, Session, User } from "@/types";
import { useQuery } from "@tanstack/react-query";
import PrintViewLogins from "./print-view-logins";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useState } from "react";
import TutorialMessageVideo from "@/components/tutorial-message-video";

export default function RosterTable({ studentRoster, session, classId, classCode }: {
    studentRoster: User[],
    session: Session,
    classId: string,
    classCode: string
}) {

    const [showAddStudentModal, setShowAddStudentModal] = useState(false);

    const [googleClassroomArr, setGoogleClassroomArr] = useState<GoogleClassroom[]>([])
    const [showGoogleClassrooms, setShowGoogleClassrooms] = useState<boolean>(false)


    function closeModal() {
        setShowAddStudentModal(false)
    }

    function updateGoogleClassrooms(classes: GoogleClassroom[], isOpen: boolean) {
        setGoogleClassroomArr(classes)
        setShowGoogleClassrooms(isOpen)
    }

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
            <ResponsiveDialog
                isOpen={showAddStudentModal}
                setIsOpen={setShowAddStudentModal}
                title="Add Student"
                description="Fill out form to add student to your roster"
            >
                {showGoogleClassrooms ?
                    <div className="mt-3">
                        <AddGoogleStudents
                            googleClassrooms={googleClassroomArr}
                            updateGoogleClassrooms={updateGoogleClassrooms}
                            session={session as Session}
                            classId={classId}
                            closeModal={closeModal}
                        />
                    </div>
                    :
                    <AddStudentForm
                        classId={classId}
                        session={session as Session}
                        updateGoogleClassrooms={updateGoogleClassrooms}
                    />
                }

            </ResponsiveDialog>

            {allStudents && allStudents.length === 0 ? (
                <div className="mt-10">
                    <TutorialMessageVideo
                        title="Your Roster is Empty!"
                        subtitle="Step 2: Add students to your Roster."
                        CTAButton={() => (
                            <AddStudentBtn onClick={() => setShowAddStudentModal(true)} />
                        )}
                        youtubeId="PE9eAIZyfII"

                    />
                </div>
            ) : (
                <div className="border rounded-md mt-20 print:hidden">
                    <div className={`
                               print:hidden
                                ${allStudents && allStudents?.length > 0 ? 'w-full absolute top-[50px] right-0 flex-between' : 'relative flex-center scale-125'}
                            `}>
                        {allStudents && allStudents?.length > 0 && <PringLoginBtn />}
                        {/* Show add student button in different position if there are students */}
                        <div className={`${allStudents && allStudents?.length > 0 ? '' : ''}`}>
                            <AddStudentBtn onClick={() => setShowAddStudentModal(true)} />
                        </div>
                    </div>
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
