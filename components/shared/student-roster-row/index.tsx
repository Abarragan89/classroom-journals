import { TableCell, TableRow } from '@/components/ui/table';
import { Session, User } from '@/types';
import React from 'react'
import StudentRosterOptionsMenu from './student-roster-options-menu';

export default function StudentRosterRow({
    studentRoster,
    session,
    classId
}: {
    studentRoster: User[],
    session: Session,
    classId: string
}) {
    return (
        <>
            {studentRoster?.length > 0 && studentRoster.sort((a, b) => {
                const lastNameA = a.name?.split(' ')[1] || '';
                const lastNameB = b.name?.split(' ')[1] || '';
                return lastNameA.localeCompare(lastNameB);
            }).map((student: User) => (
                <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.username}</TableCell>
                    <TableCell>{student.password}</TableCell>
                    <TableCell className="text-right">
                        <StudentRosterOptionsMenu
                            studentInfo={student}
                            session={session}
                            classId={classId}
                        />
                    </TableCell>
                </TableRow>
            ))}
        </>
    )
}
