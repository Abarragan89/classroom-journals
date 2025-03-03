import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator";
import { Prompt } from "@/types";
import OptionsMenu from "./options-menu";
import { Button } from "@/components/ui/button";

export default function PromptCard({ promptData }: { promptData: Prompt }) {
    return (
        <Card className="w-[350px] h-[250px] relative mb-14">
            {/* Absolutely positions options menu with responsive dialogs */}
            <OptionsMenu promptData={promptData} />
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
                <p>Assigned: {promptData.createdAt.toLocaleDateString()}</p>
            </CardFooter>
        </Card>
    )
}
