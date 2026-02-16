'use client'
import { ResponsiveDialog } from '../responsive-dialog'
import { Users, ArrowBigLeft } from 'lucide-react'
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import VideoAccordion from '@/app/(classroom)/classroom/[classId]/[teacherId]/teacher-guide/video-accordion';
import AddStudentForm from '../forms/roster-forms/add-student-button/add-student-form';
import { Session } from '@/types';

export default function TutorialModal({
    isModalOpen,
    onClose,
    classId,
    session
}: {
    isModalOpen: boolean,
    onClose: () => void,
    classId: string,
    session: Session
}) {

    const handleClose = () => {
        onClose();
    };

    const [showTutorialVideos, setShowTutorialVideos] = useState<boolean>(false)

    return (
        <ResponsiveDialog
            isOpen={isModalOpen}
            setIsOpen={handleClose}
            title="Welcome to your Classroom!"
        >
            {showTutorialVideos ? (
                <>
                    <Button
                        onClick={() => setShowTutorialVideos(false)}
                        variant={"secondary"}
                        className='w-fit'
                    >
                        <ArrowBigLeft /> Back
                    </Button>
                    <div className='custom-scrollbar overflow-y-scroll h-[60vh]'>
                        <VideoAccordion />
                    </div>
                </>
            ) : (
                <div>
                    {/* List Items */}
                    <div className="space-y-4 mt-2">
                        {/* Step 1 */}
                        <div className="flex flex-wrap gap-4 items-start p-4 rounded-lg border">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                1
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold text-lg">Build Your Roster</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Add students to your class and print their login credentials
                                </p>
                            </div>
                        </div>

                        <AddStudentForm
                            classId={classId}
                            session={session}
                            updateGoogleClassrooms={() => { }}
                        />
                    </div>
                    {/* Video Link */}
                    <div className="p-4 rounded-lg border mt-4">
                        <p className="text-sm text-center">
                            <span className="text-muted-foreground">Need help? Watch our</span>
                            <Button
                                onClick={() => setShowTutorialVideos(true)}
                                variant={"link"}
                                className={"p-0 ml-2 underline"}
                            >
                                1-minute tutorial videos
                            </Button>
                        </p>
                    </div>
                    {/* CTA Button */}
                    <Button
                        onClick={handleClose}
                        className="w-full mt-4 mb-4"
                    >
                        Got It, Let&apos;s Start!
                    </Button>
                </div>

            )
            }
        </ResponsiveDialog >
    )
}


// {/* Step 2 */ }
// <div className="flex flex-wrap  gap-4 items-start p-4 rounded-lg border">
//     <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
//         2
//     </div>
//     <div className="flex-1">
//         <div className="flex items-center gap-2 mb-2">
//             <FileText className="w-5 h-5 text-primary" />
//             <h3 className="font-semibold text-lg">Create Your First <span className='font-bold text-primary'>JOT</span></h3>
//         </div>
//         <p className="text-sm text-muted-foreground">
//             Choose between a blog prompt or an assessment
//         </p>
//     </div>
// </div>

// {/* Step 3 */ }
// <div className="flex flex-wrap  gap-4 items-start p-4 rounded-lg border">
//     <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
//         3
//     </div>
//     <div className="flex-1">
//         <div className="flex items-center gap-2 mb-2">
//             <Send className="w-5 h-5 text-primary" />
//             <h3 className="font-semibold text-lg">Assign <span className='font-bold text-primary'>JOT</span> to Your Class</h3>
//         </div>
//         <p className="text-sm text-muted-foreground">
//             Send the assignment and watch students start writing
//         </p>
//     </div>
// </div>