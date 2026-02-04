'use client'
import { useState } from 'react'
import { ResponsiveDialog } from '../responsive-dialog'
import { Users, FileText, Send, TrendingUp } from 'lucide-react'

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
            description="Get started in 3 simple steps"
        >
            <div className="space-y-4 mt-4">
                {/* Step 1 */}
                <div className="flex gap-4 items-start p-4 rounded-lg bg-accent/10 border border-accent/20">
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
                <div className="flex gap-4 items-start p-4 rounded-lg bg-accent/10 border border-accent/20">
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
                <div className="flex gap-4 items-start p-4 rounded-lg bg-accent/10 border border-accent/20">
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

            {/* Footer */}
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-lg mb-1">You&apos;re all set!</p>
                        <p className="text-sm text-muted-foreground">
                            Track student progress, view responses, and provide feedback in the <span className="font-semibold text-foreground">Assignments</span> tab.
                        </p>
                    </div>
                </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
                Learn everything JotterBlog can do in 1 minute <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/classroom/${classId}/${teacherId}/teacher-guide`} target="_blank" rel="noreferrer" className="hover:underline text-primary font-bold block">Teacher Guide Videos.</a>
            </p>
        </ResponsiveDialog>
    )
}