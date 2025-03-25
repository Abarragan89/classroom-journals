import {
    Card,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator";
import { Classroom, Prompt } from "@/types";
import OptionsMenu from "./options-menu";
import AssignedToPopUp from "./assigned-to-popup";
import QuestionPopup from "./question-popup";
import { PromptSession } from "@/types";

export default function PromptCard({
    promptData,
    updatePromptData,
    classroomData
}: {
    promptData: Prompt
    updatePromptData: React.Dispatch<React.SetStateAction<Prompt[]>>
    classroomData: Classroom[]
}) {

    return (
        <Card className="w-[100%] sm:w-[275px] relative">
            {/* Absolutely positions options menu, type, and class colors with responsive dialogs */}
            <OptionsMenu
                promptData={promptData}
                updatePromptData={updatePromptData}
                classroomData={classroomData}
            />
            {promptData.promptType === 'multi-question' ? (
                <p className="text-xs w-fit text-accent-foreground bg-accent rounded-md py-[3px] px-2 mt-3 ml-3">Assessment</p>
            ) : (
                <p className="text-xs w-fit text-card bg-card-foreground rounded-md py-[3px] px-2 mt-3 ml-3">Blog</p>
            )}

            <CardHeader className="flex flex-row justify-between text-sm h-[200px] overflow-hidden mt-1">
                <div className="w-[95%]">
                    <CardTitle className="tracking-wide leading-5 line-clamp-[7]">
                        {promptData.title}
                    </CardTitle>
                </div>
            </CardHeader>
            <Separator />
            <CardFooter className="flex justify-between text-xs py-2 px-3">
                <QuestionPopup promptQuestions={promptData as unknown as Prompt} />
                <AssignedToPopUp classesData={promptData.promptSession as unknown as PromptSession[]} />
            </CardFooter>
        </Card>
    )
}
