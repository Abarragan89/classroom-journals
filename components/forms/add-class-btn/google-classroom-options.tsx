import { Button } from '@/components/ui/button'
import { GoogleClassroom, Session } from '@/types'
import Image from 'next/image'
import React from 'react'
import { useState } from 'react'
import { createClassroomWithGoogle } from '@/lib/actions/google.classroom.actions'
import { useRouter } from 'next/navigation'

export default function GoogleClassroomOptions({
    googleClassrooms,
    updateGoogleClassrooms,
    session
}: {
    googleClassrooms: GoogleClassroom[],
    updateGoogleClassrooms: (classes: GoogleClassroom[], isOpen: boolean) => void
    session: Session
}) {

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const router = useRouter();

    async function createClassroom(classInfo: GoogleClassroom) {
        try {
            setIsLoading(true)
            const classroomUrl = await createClassroomWithGoogle(classInfo, session?.user?.id)
            router.push(`/classroom/${classroomUrl}`)
        } catch (error) {
            console.log('error creating classroom', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex-center min-h-[280px]">
                <p className='font-bold flex-center'>Creating Class...</p>
            </div>
        )
    }

    return (
        <>
            {googleClassrooms?.length > 0 ? (
                <p className='font-bold text-md text-center mb-3'>Choose a class to import</p>
            ) : (
                <>
                <p className='text-md w-[75%] mb-1 mx-auto text-center'>No classrooms associated with your Google Account:</p>
                <p className='mb-5 mt-2 text-center font-bold'>{session.user.email}</p>
                </>
                
            )}
            {googleClassrooms?.length > 0 && googleClassrooms.map((classroom) => (
                <div
                    onClick={() => createClassroom(classroom)}
                    className='grid grid-cols-4 p-1 bg-gray-300  rounded-xl mx-4 mb-6 border-[1px] border-gray-300 hover:cursor-pointer hover:bg-white'
                    key={classroom.id}>
                    <Image
                        src='/images/google-classroom-logo.png'
                        alt='Google classroom logo'
                        height={75}
                        width={75}
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
