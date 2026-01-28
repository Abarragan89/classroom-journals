import { getAllStudents } from "@/lib/server/classroom";
import { Session, User } from "@/types";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { notFound } from "next/navigation";
import TutorialModal from "@/components/modals/tutorial-modal";
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

  const showTutorialModal = resolvedSearchParams?.tutorialModal === 'true';

  return (
    <>
      <TutorialModal isModalOpen={showTutorialModal} />
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

