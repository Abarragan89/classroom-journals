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
import { FileText, ClipboardList } from "lucide-react";

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
    const isAssessment = promptData.promptType === 'ASSESSMENT';
    const assignedCount = promptData.promptSession?.length || 0;

    return (
        <Card className="w-full relative shadow-sm hover:shadow-md transition-shadow group">
            {/* Options Menu - positioned absolutely */}
            <OptionsMenu
                promptData={promptData}
                updatePromptData={updatePromptData}
                classroomData={classroomData}
                teacherId={teacherId}
            />

            <div className="p-4 pb-3 flex flex-col gap-4">
                {/* Icon & Title Row - Centered */}
                <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 flex-shrink-0 flex items-center justify-center ${isAssessment ? 'text-primary' : 'text-secondary'
                        }`}>
                        {isAssessment ? (
                            <ClipboardList className="w-7 h-7" />
                        ) : (
                            <FileText className="w-7 h-7" />
                        )}
                    </div>
                    <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {promptData.title}
                    </h3>
                </div>

                {/* Metadata Footer */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-3 border-t">
                    <div className="flex items-center gap-2">
                        <Badge variant={isAssessment ? "default" : "secondary"} className="text-xs">
                            {isAssessment ? 'Assessment' : 'Blog'}
                        </Badge>
                        {promptData?.category?.name && (
                            <span className="text-xs text-muted-foreground">
                                {promptData.category.name}
                            </span>
                        )}
                    </div>

                    <Separator orientation="vertical" className="h-4" />

                    <QuestionPopup promptQuestions={promptData as unknown as Prompt} />

                    <Separator orientation="vertical" className="h-4" />

                    <AssignedToPopUp classesData={promptData.promptSession as unknown as PromptSession[]} />

                    {/* {assignedCount > 0 && (
                        <>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="flex items-center gap-1">
                                <span className="font-medium text-foreground">{assignedCount}</span>
                                {assignedCount === 1 ? 'class' : 'classes'}
                            </span>
                        </>
                    )} */}
                </div>
            </div>
        </Card>
    )
}
