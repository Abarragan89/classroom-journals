'use client'
import { useState } from 'react'
import { ResponsiveDialog } from '../responsive-dialog'
import { Users, FileText, Send, TrendingUp } from 'lucide-react'
import { Separator } from '../ui/separator';

export default function TutorialModal({ isModalOpen }: { isModalOpen: boolean }) {

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
                            <h3 className="font-semibold text-lg">Create Your First JOT</h3>
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
                            <h3 className="font-semibold text-lg">Assign to Your Class</h3>
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
                        <p className="font-semibold text-sm mb-1">You're all set!</p>
                        <p className="text-sm text-muted-foreground">
                            Track student progress, view responses, and provide feedback in the <span className="font-semibold text-foreground">Assignments</span> tab.
                        </p>
                    </div>
                </div>
            </div>
            <Separator className="" />
            <p className="text-sm text-muted-foreground text-center">
                Learn everything JotterBlog can do in your classroom in our <a href="https://docs.jotterblog.com/for-teachers/getting-started-with-jotterblog" target="_blank" rel="noreferrer" className="underline hover:text-primary font-bold">Teacher Guide</a>.
            </p>
        </ResponsiveDialog>
    )
}