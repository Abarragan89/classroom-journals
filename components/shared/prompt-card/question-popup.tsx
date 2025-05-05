import { Prompt } from "@/types";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from '@/components/ui/separator'

export default function QuestionPopup({ promptQuestions }: { promptQuestions: Prompt }) {

    return (
        <Popover>
            <div className='flex-center'>
                <PopoverTrigger asChild>
                    <p className='hover:cursor-pointer text-foreground hover:underline rounded-md py-[3px] px-2'>
                        {promptQuestions?.promptType === 'ASSESSMENT' ? (
                            'Questions: ' + promptQuestions?.questions?.length
                        ) : (
                            'Full Prompt'
                        )}
                    </p>
                </PopoverTrigger>
            </div>
            <PopoverContent className="w-80 p-3">
                <p className='text-center'>Questions</p>
                <Separator className='my-1 bg-ring' />
                {promptQuestions?.promptType === 'ASSESSMENT' ? promptQuestions?.questions?.map((question, index) => (
                    <div key={index} className="flex justif-start items-start text-sm mt-2">
                        <p className="mr-2">{`${index + 1}.`}</p>
                        <p className="mb-3" >{`${question.question}`}</p>
                    </div>
                )) : (
                    <div className="flex justif-start items-start text-sm mt-2">
                        <p className="mr-2">1</p>
                        <p className="mb-3" >{`${promptQuestions?.questions[0].question}`}</p>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
