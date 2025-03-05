import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator";
import { Prompt } from "@/types";
import OptionsMenu from "./options-menu";
import { Button } from "@/components/ui/button";
import AssignedToPopUp from "./assigned-to-popup";

export default function PromptCard({
    teacherId,
    promptData,
    updatePromptData
}: {
    teacherId: string,
    promptData: Prompt
    updatePromptData: React.Dispatch<React.SetStateAction<Prompt[]>>
}) {

    console.log('class /Data', promptData)
    
    return (
        <Card className="w-[100%] sm:w-[320px] h-[250px] relative mb-14">
            {/* Absolutely positions options menu with responsive dialogs */}
            <OptionsMenu teacherId={teacherId} promptData={promptData} updatePromptData={updatePromptData} />
            <CardHeader className="flex flex-row justify-between h-[130px]">
                <div className="w-[95%]">
                    <CardTitle className="tracking-wide leading-5">{promptData.title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-end mt-3">
                <Button variant='outline'>
                    Assign
                </Button>
            </CardContent>
            <Separator />
            <CardFooter className="flex justify-between text-sm mt-2 pb-3">
                <p>Questions: {promptData.questions.length}</p>
                <AssignedToPopUp classesData={promptData.promptSession as unknown as Prompt}/>
            </CardFooter>
        </Card>
    )
}
