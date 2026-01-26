import { Button } from '@/components/ui/button'
import { GoogleClassroom, Session } from '@/types'
import Image from 'next/image'
import React from 'react'
import { useState } from 'react'
import { createClassroomWithGoogle } from '@/lib/actions/google.classroom.actions'
import { useRouter } from 'next/navigation'
import LoadingAnimation from '@/components/loading-animation'

export default function GoogleClassroomOptions({
    googleClassrooms,
    updateGoogleClassrooms,
    session,
    teacherId
}: {
    googleClassrooms: GoogleClassroom[],
    updateGoogleClassrooms: (classes: GoogleClassroom[], isOpen: boolean) => void
    session: Session,
    teacherId: string

}) {

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const router = useRouter();

    async function createClassroom(classInfo: GoogleClassroom) {
        try {
            setIsLoading(true)
            const classroomUrl = await createClassroomWithGoogle(classInfo, session?.user?.id)
            router.push(`classroom/${classroomUrl}/${teacherId}/roster?tutorialModal=true`);
        } catch (error) {
            console.error('error creating classroom', error)
            setIsLoading(false)
        } finally {
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[240px]">
                <p className='font-bold mt-[-60px]'>Creating Class...</p>
                <LoadingAnimation />
            </div>
        )
    }

    return (
        <>
            {googleClassrooms?.length > 0 ? (
                <p className='font-bold text-md text-center mb-3'>Choose a class to import</p>
            ) : (
                <div className='space-y-2 mb-5'>
                    <p className='text-center text-destructive font-bold mb-2'>No Google Classes Found</p>
                    <ul className='text-center
                    space-y-1 text-sm'>
                        <li className='text-muted-foreground max-w-[260px] mx-auto mb-3'>Give JotterBlog access to your Google Classrooms when logging in</li>
                        <li className="text-center relative text-muted-foreground max-w-[150px] mx-auto">
                            <span className="relative z-10 bg-background px-3">or</span>
                            <span className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 border-t border-gray-500"></span>
                        </li>
                        <li className='text-muted-foreground max-w-[260px] mx-auto'>Create a Google Classroom using {session?.user?.email}</li>
                    </ul>
                </div>
            )}
            {googleClassrooms?.length > 0 && googleClassrooms.map((classroom) => (
                <div
                    onClick={() => createClassroom(classroom)}
                    className='grid grid-cols-4 p-3 items-center rounded-xl mx-4 mb-6 bg-card border hover:cursor-pointer hover:border-primary hover:shadow-md'
                    key={classroom.id}>
                    <Image
                        src='/images/google-classroom-logo.png'
                        alt='Google classroom logo'
                        height={65}
                        width={65}
                        className="border-[2px] border-l-[4px] border-r-[4px] rounded-xl"
                        style={{ borderColor: "rgb(255, 194, 38)" }}
                    />
                    <div className='text-black col-span-3 my-1'>
                        <p className='text-md font-bold'>{classroom.name}</p>
                        <p className='text-sm'> <span className='font-bold mr-1 my-3'>Section: </span>{classroom?.section ? classroom.section : 'N/A'}</p>
                        <div className="flex-between w-full pr-5">
                            <p className='text-sm'><span className='font-bold mr-1'>Room:</span> {classroom?.room ? classroom.room : 'N/A'}</p>
                            <p className='text-sm'><span className='font-bold mr-1'>Class Code:</span> {classroom?.enrollmentCode ? classroom.enrollmentCode : 'N/A'}</p>
                        </div>
                    </div>
                </div>
            ))}
            <div className="flex-center">
                <Button variant='outline' onClick={() => updateGoogleClassrooms([], false)}>Back</Button>
            </div>
        </>
    )
}
