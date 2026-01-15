import {
    Card,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator";
import { Classroom, Prompt } from "@/types";
import OptionsMenu from "./options-menu";
import AssignedToPopUp from "./assigned-to-popup";
import QuestionPopup from "./question-popup";
import { PromptSession } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import AssignPromptForm from "@/components/forms/prompt-forms/assign-prompt-form";
import { useState } from "react";

export default function PromptCard({
    promptData,
    updatePromptData,
    classroomData,
    teacherId
}: {
    promptData: Prompt
    updatePromptData: React.Dispatch<React.SetStateAction<Prompt[]>>
    classroomData: Classroom[],
    teacherId: string
}) {
    const isAssessment = promptData.promptType === 'ASSESSMENT';;
    const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false)



    return (
        <>
            {/* Assign Prompt Modal */}
            <ResponsiveDialog
                isOpen={isAssignModalOpen}
                setIsOpen={setIsAssignModalOpen}
                title={`Assign`}
                description='Select which classes to assign to'
            >
                <AssignPromptForm
                    promptId={promptData?.id}
                    promptTitle={promptData?.title}
                    promptType={promptData?.promptType as string}
                    closeModal={() => setIsAssignModalOpen(false)}
                    updatePromptData={updatePromptData}
                    classroomData={classroomData}
                    teacherId={teacherId}
                />

            </ResponsiveDialog>
            <Card className="max-w-[660px] mx-auto relative">
                {/* Options Menu - positioned absolutely */}
                <OptionsMenu
                    promptData={promptData}
                    updatePromptData={updatePromptData}
                    teacherId={teacherId}
                />

                <div className="p-4 pb-3 flex flex-col gap-2">

                    {/* Metadata Header */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap pb-2 border-b">
                        {promptData?.category?.name && (
                            <>
                                <span className="text-xs text-muted-foreground">
                                    {promptData.category.name}
                                </span>
                                <Separator orientation="vertical" className="h-4" />
                            </>
                        )}
                        <QuestionPopup promptQuestions={promptData as unknown as Prompt} />
                        <Separator orientation="vertical" className="h-4" />
                        <AssignedToPopUp classesData={promptData.promptSession as unknown as PromptSession[]} />
                    </div>
                    {/* Icon & Title Row - Centered */}
                    <Badge variant={isAssessment ? "default" : "secondary"} className="text-xs w-fit">
                        {isAssessment ? 'Assessment' : 'Blog'}
                    </Badge>
                    <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors mr-5">
                            {promptData.title}
                        </h3>
                    </div>
                    <Button
                        onClick={() => setIsAssignModalOpen(true)}
                        variant={"outline"}
                    >Assign</Button>
                </div>
            </Card>
        </>
    )
}
