import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { getSingleClassroom } from "@/lib/actions/classroom.actions";
import { prisma } from "@/db/prisma";
import { notFound } from "next/navigation"; // Import notFound for 404 handling
import { Class, Session } from "@/types";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default async function Classroom({ params }: { params: Promise<{ classId: string }> }) {
    const session = await auth()
    console.log('session ', session)
    if (!session) {
        notFound()
    }

    const teacherId = session?.user?.id as string
    if (!teacherId) notFound()

    const classroomId = (await params).classId
    if (!classroomId) notFound()


    // Check if the authenticated teacher is part of the classroom and has the role of 'teacher'
    const isTeacherAuthorized = await prisma.classUser.findFirst({
        where: {
            classId: classroomId,
            userId: teacherId,
            role: 'teacher'
        }
    });

    if (!isTeacherAuthorized) notFound()

    // Get Class Data
    const classroomData = await getSingleClassroom(classroomId) as Class;

    return (
        <>
            <Header teacherId={teacherId}  session={session as Session}/>
            <main className="wrapper">
                <Link href={'/classes'} className="flex items-center hover:underline w-fit">
                    <ArrowLeftIcon className="mr-1" size={20} />Back to all classes
                </Link>
                <h1 className="h1-bold mt-5">{classroomData.name}</h1>
            </main>
        </>
    )
}
