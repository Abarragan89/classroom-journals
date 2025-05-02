import { getAllStudents } from "@/lib/actions/classroom.actions";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Session, User } from "@/types";
import AddStudentBtn from "@/components/forms/roster-forms/add-student-button";
import { auth } from "@/auth";
import StudentRosterRow from "@/components/shared/student-roster-row";
import PringLoginBtn from "@/components/buttons/print-login";
import PrintViewLogins from "./print-view-logins";
import { prisma } from "@/db/prisma";

export default async function Roster({
  params
}: {
  params: Promise<{ classId: string, teacherId: string }>
}) {

  const { classId } = await params;

  const studentRoster = (await getAllStudents(classId)) as unknown as User[];
  const  classCode  = await prisma.classroom.findUnique({
    where: { id: classId },
    select: {
      classCode: true
    }
  })

  const session = await auth() as Session;

  return (
    <>
      <div className="relative print:hidden">
        <div className="flex-between w-full absolute top-[40px] right-0">
          <PringLoginBtn />
          <AddStudentBtn classId={classId} session={session} />
        </div>
        <h2 className="text-2xl lg:text-3xl mt-2">Class Roster</h2>
        <Table className="mt-14">
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
              studentRoster={studentRoster}
              session={session}
              classId={classId}
            />
          </TableBody>
        </Table>
      </div>

      {/* Only visible in print view */}
      <PrintViewLogins
        classCode={classCode?.classCode as string}
        // classCode={classCode as string}
        studentRoster={studentRoster}
      />
    </>
  )
}

