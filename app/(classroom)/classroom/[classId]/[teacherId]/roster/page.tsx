import { getAllStudents } from "@/lib/server/classroom";
import { Session, User } from "@/types";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { notFound } from "next/navigation";
import TutorialFlowWrapper from "@/components/tutorial/tutorial-flow-wrapper";
import RosterTable from "./roster-table";

export default async function Roster({
  params,
  searchParams
}: {
  params: Promise<{ classId: string, teacherId: string }>,
  searchParams: Promise<{ [key: string]: string }>
}) {
  const session = await auth() as Session;
  // return not found 
  if (!session) return notFound();

  const { classId, teacherId } = await params;
  const resolvedSearchParams = await searchParams;

  const [studentRoster, classCode] = await Promise.all([
    getAllStudents(classId, teacherId) as unknown as User[],
    prisma.classroom.findUnique({
      where: { id: classId },
      select: { classCode: true }
    })
  ]);

  // Get tutorial step from URL params ('start' or 'showArrow')
  const tutorialStep = resolvedSearchParams?.tutorial;

  return (
    <>
      <TutorialFlowWrapper
        tutorialStep={tutorialStep}
        classId={classId}
        teacherId={teacherId}
        initialStudentCount={studentRoster.length}
        session={session}
      />
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

