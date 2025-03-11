import { getAllStudents } from "@/lib/actions/classroom.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { User } from "@/types";
import StudentOptionsMenu from "@/components/menus/student-options-menu";

export default async function Roster({
  params
}: {
  params: Promise<{ classId: string, teacherId: string }>
}) {

  const { classId } = await params;

  let studentRoster = (await getAllStudents(classId)) as unknown as User[];


  return (
    <div>
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
          {studentRoster?.length > 0 && studentRoster.map((student: User) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell>{student.username}</TableCell>
              <TableCell>{student.password}</TableCell>
              <TableCell className="text-right"><StudentOptionsMenu /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

