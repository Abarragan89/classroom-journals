import {
    Card,
    CardContent,
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
        <Card className="w-[100%] sm:w-[320px] relative mb-14">
            {/* Absolutely positions options menu with responsive dialogs */}
            <OptionsMenu teacherId={teacherId} promptData={promptData} updatePromptData={updatePromptData} />
            <CardHeader className="flex flex-row justify-between h-[130px]">
                <div className="w-[95%]">
                    <CardTitle className="tracking-wide leading-5">{promptData.title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-end mt-3">
            </CardContent>
            <Separator />
            <CardFooter className="flex justify-between text-sm mt-2 pb-3">
                <QuestionPopup promptQuestions={promptData.questions as unknown as Question[]} />
                <AssignedToPopUp classesData={promptData.promptSession as unknown as PromptSession[]} />
            </CardFooter>
        </Card>
    )
}
