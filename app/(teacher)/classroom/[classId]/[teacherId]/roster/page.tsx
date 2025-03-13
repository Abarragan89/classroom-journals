import { getAllStudents } from "@/lib/actions/classroom.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Session, User } from "@/types";
import StudentOptionsMenu from "@/components/menus/student-roster-options-menu";
import AddStudentBtn from "@/components/forms/roster-forms/add-student-button";
import { auth } from "@/auth";

export default async function Roster({
  params
}: {
  params: Promise<{ classId: string, teacherId: string }>
}) {

  const { classId } = await params;

  const studentRoster = (await getAllStudents(classId)) as unknown as User[];

  const session = await auth() as Session;

  return (
    <div className="relative">
      <div className="absolute top-[-120px] right-[2%]">
        <AddStudentBtn classId={classId} session={session} variant='secondary' />
      </div>
      <h2 className="text-2xl mt-2">Student Roster</h2>
      <Table className="mt-5">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Password</TableHead>
            <TableHead className="text-right">&nbsp;</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
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
                <StudentOptionsMenu
                  studentInfo={student}
                  session={session}
                  classId={classId}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

