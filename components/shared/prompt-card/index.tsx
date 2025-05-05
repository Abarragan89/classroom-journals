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
    classroomData,
    teacherId
}: {
    promptData: Prompt
    updatePromptData: React.Dispatch<React.SetStateAction<Prompt[]>>
    classroomData: Classroom[],
    teacherId: string
}) {

    return (
        <Card className="w-[100%] sm:w-[265px] relative shadow-sm shadow-accent">
            {/* Absolutely positions options menu, type, and class colors with responsive dialogs */}
            <OptionsMenu
                promptData={promptData}
                updatePromptData={updatePromptData}
                classroomData={classroomData}
                teacherId={teacherId}
            />
            {promptData.promptType === 'ASSESSMENT' ? (
                <div className="w-full text-foreground bg-ring rounded-xl rounded-b-none h-[70px]">
                    <div className="p-3">
                        <p className="text-xl font-bold">{promptData?.category?.name}</p>
                        <p className={`${promptData?.category?.name ? 'text-xs' : 'text-2xl font-bold'}`}>Assessment</p>
                        {!promptData?.category?.name &&
                            <p className="text-xs">(no category)</p>
                        }
                    </div>
                </div>
            ) : (
                <div className="w-full text-foreground bg-ring rounded-xl rounded-b-none h-[70px] ">
                    <div className="p-3">
                        <p className="text-xl font-bold">{promptData?.category?.name}</p>
                        <p className={`${promptData?.category?.name ? 'text-xs' : 'text-2xl font-bold'}`}>Blog</p>
                        {!promptData?.category?.name &&
                            <p className="text-xs">(no category)</p>
                        }
                    </div>
                </div>
            )}

            <CardHeader className="flex flex-row justify-between text-sm h-[150px] overflow-hidden">
                <div >
                    <CardTitle className="tracking-wide leading-5 line-clamp-5">
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
