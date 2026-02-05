'use client'
import { useState } from 'react'
import { ResponsiveDialog } from '../responsive-dialog'
import { Users, FileText, Send } from 'lucide-react'
import { Button } from '@/components/ui/button';
import Link from 'next/link'

export default function TutorialModal({
    isModalOpen,
    classId,
    teacherId
}: {
    isModalOpen: boolean,
    classId: string,
    teacherId: string
}) {

    const [isOpen, setIsOpen] = useState<boolean>(isModalOpen);

    return (
        <ResponsiveDialog
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Welcome to your Classroom!"
        >
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

                {/* Step 2 */}
                <div className="flex flex-wrap  gap-4 items-start p-4 rounded-lg border">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        2
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-lg">Create Your First <span className='font-bold text-primary'>JOT</span></h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Choose between a blog prompt or an assessment
                        </p>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-wrap  gap-4 items-start p-4 rounded-lg border">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        3
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Send className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-lg">Assign <span className='font-bold text-primary'>JOT</span> to Your Class</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Send the assignment and watch students start writing
                        </p>
                    </div>
                </div>
            </div>

            {/* Video Link */}
            <div className="p-4 rounded-lg border">
                <p className="text-sm text-center">
                    <span className="text-muted-foreground">Need help? Watch our </span>
                    <Link 
                        href={`${process.env.NEXT_PUBLIC_BASE_URL}/classroom/${classId}/${teacherId}/teacher-guide`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="font-semibold text-primary hover:underline"
                    >
                        1-minute tutorial videos
                    </Link>
                </p>
            </div>

            {/* CTA Button */}
            <Button 
                onClick={() => {
                    setIsOpen(false)
                    window.history.replaceState({}, '', window.location.pathname)
                }}
                className="w-full mt-2 mb-4"
            >
                Got It, Let&apos;s Start!
            </Button>
        </ResponsiveDialog>
    )
}