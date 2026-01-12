import { getAllStudents } from "@/lib/server/classroom";
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
import { notFound } from "next/navigation";

export default async function Roster({
  params
}: {
  params: Promise<{ classId: string, teacherId: string }>
}) {
  const session = await auth() as Session;
  // return not found 
  if (!session) return notFound();

  const { classId, teacherId } = await params;

  const [studentRoster, classCode] = await Promise.all([
    getAllStudents(classId, teacherId) as unknown as User[],
    prisma.classroom.findUnique({
      where: { id: classId },
      select: { classCode: true }
    })
  ]);


  return (
    <>
      <div className="relative print:hidden">
        <div className="flex-between w-full absolute top-[50px] right-0">
          {studentRoster.length > 0 && (
            <>
              <PringLoginBtn />
              <AddStudentBtn classId={classId} session={session} />
            </>
          )}

        </div>
        <h2 className="text-2xl lg:text-3xl mt-2">Class Roster</h2>
        {studentRoster.length === 0 ? (
          <>
            <p className="mt-10 text-2xl text-center">
              Add students to the roster!
            </p>
            <div className="flex-center mt-5 scale-125">
              <AddStudentBtn classId={classId} session={session} />
            </div>
          </>
        ) : (
          <Table className="mt-24">
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
        )}
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

