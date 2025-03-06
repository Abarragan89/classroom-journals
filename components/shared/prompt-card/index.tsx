import {
    Card,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator";
import { Prompt, Question } from "@/types";
import OptionsMenu from "./options-menu";
import AssignedToPopUp from "./assigned-to-popup";
import QuestionPopup from "./question-popup";
import { PromptSession } from "@prisma/client";

export default function PromptCard({
    teacherId,
    promptData,
    updatePromptData
}: {
    teacherId: string,
    promptData: Prompt
    updatePromptData: React.Dispatch<React.SetStateAction<Prompt[]>>
}) {

    return (
        <Card className="w-[100%] sm:w-[285px] relative mb-14">
            {/* Absolutely positions options menu, type, and class colors with responsive dialogs */}
            <OptionsMenu teacherId={teacherId} promptData={promptData} updatePromptData={updatePromptData} />
            {promptData.promptType === 'multi-question' ? (
                <p className="text-xs absolute left-3 top-2 italic">Multi-Question</p>
            ) : (
                <p className="text-xs absolute left-3 top-2 italic">Journal</p>
            )}

            <CardHeader className="flex flex-row justify-between text-sm h-[200px] overflow-hidden mt-1">
                <div className="w-[95%]">
                    <CardTitle className="tracking-wide leading-5 mt-2 line-clamp-[7]">
                        {promptData.title}
                    </CardTitle>
                </div>
            </CardHeader>
            <Separator />
            <CardFooter className="flex justify-between text-xs mt-2 pb-3 px-3">
                <QuestionPopup promptQuestions={promptData.questions as unknown as Question[]} />
                <AssignedToPopUp classesData={promptData.promptSession as unknown as PromptSession[]} />
            </CardFooter>
        </Card>
    )
}
