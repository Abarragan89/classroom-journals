import { Prompt } from "@/types";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from '@/components/ui/separator'
import { MessageSquare } from 'lucide-react'

export default function QuestionPopup({ promptQuestions }: { promptQuestions: Prompt }) {
    const questionCount = promptQuestions?.questions?.length || 0;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className='flex items-center gap-1.5 hover:text-primary transition-colors'>
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>
                        {promptQuestions?.promptType === 'ASSESSMENT' ? (
                            <>{questionCount} {questionCount === 1 ? 'question' : 'questions'}</>
                        ) : (
                            'View prompt'
                        )}
                    </span>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
                <p className='text-center font-semibold'>Questions</p>
                <Separator className='my-2' />
                {promptQuestions?.promptType === 'ASSESSMENT' ? promptQuestions?.questions?.map((question, index) => (
                    <div key={index} className="flex justify-start items-start text-sm mt-2">
                        <p className="mr-2 font-medium text-muted-foreground">{`${index + 1}.`}</p>
                        <p className="mb-3" >{`${question.question}`}</p>
                    </div>
                )) : (
                    <div className="flex justify-start items-start text-sm mt-2">
                        <p className="mr-2 font-medium text-muted-foreground">1.</p>
                        <p className="mb-3" >{`${promptQuestions?.questions[0].question}`}</p>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}