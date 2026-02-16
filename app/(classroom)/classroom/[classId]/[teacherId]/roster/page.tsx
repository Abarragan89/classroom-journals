import { getAllStudents } from "@/lib/server/classroom";
import { Session, User } from "@/types";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { notFound } from "next/navigation";
import RosterTable from "./roster-table";

export default async function Roster({
  params,
}: {
  params: Promise<{ classId: string, teacherId: string }>,
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
      <div className="relative">
        <h2 className="text-2xl lg:text-3xl mt-2 print:hidden">Class Roster</h2>
        <RosterTable
          studentRoster={studentRoster}
          session={session}
          classId={classId}
          classCode={classCode?.classCode as string}
        />
      </div>
    </>
  )
}

