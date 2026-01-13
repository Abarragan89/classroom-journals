"use client"
import { useState } from 'react'
import { Question } from '@/types'
import { Separator } from '@/components/ui/separator'
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi'

export default function ClientQuestionControls({
    questions,
    sessionType
}: {
    questions: Question[],
    sessionType: string
}) {

    const [currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [selectedPaper, setSelectedPaper] = useState<string>('blank');

    function nextQuestion() {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1)
        }
    }

    function prevQuestion() {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1)
        }
    }

    const disabledArrowStyles = 'border border-border rounded-sm opacity-50 pointer-events-none'
    const enabledArrowStyles = 'hover:cursor-pointer hover:text-accent border border-border rounded-sm hover:bg-input hover:text-foreground'

    const blankPaper = 'h-screen'
    const graphPaper1 = "h-screen bg-[length:40px_40px] bg-[linear-gradient(to_right,grey_1px,transparent_1px),linear-gradient(to_bottom,grey_1px,transparent_1px)]";
    const graphPaper2 = "h-screen bg-[length:50px_50px] bg-[linear-gradient(to_right,grey_1px,transparent_1px),linear-gradient(to_bottom,grey_1px,transparent_1px)]";
    const linePaper1 = "h-screen bg-[length:40px_40px] bg-[linear-gradient(to_bottom,grey_1px,transparent_1px)]";
    const linePaper2 = "h-screen bg-[length:50px_50px] bg-[linear-gradient(to_bottom,grey_1px,transparent_1px)]";

    return (
        <>
            {sessionType === 'ASSESSMENT' && (
                <div className="flex-between max-w-[100px] my-3">
                    <BiChevronLeft
                        size={25}
                        onClick={prevQuestion}
                        className={`
                        ${currentQuestion === 0 ? disabledArrowStyles : enabledArrowStyles}    
                        `}
                    />
                    <BiChevronRight
                        size={25}
                        onClick={nextQuestion}
                        className={`
                        ${currentQuestion === questions.length - 1 ? disabledArrowStyles : enabledArrowStyles}
                    `}
                    />
                </div>
            )}
            <p
                className={`whitespace-pre-line my-5 font-bold ${sessionType === 'ASSESSMENT' ? 'text-center' : 'text-left'}`}
            >{questions[currentQuestion].question}</p>
            <Separator className='mt-5 mb-2' />
            <div className='flex-between mb-9 mx-auto max-w-[500px]'>
                <p className={`hover:cursor-pointer hover:text-accent mx-2 text-center text-sm ${selectedPaper === 'blank' ? 'text-muted-foreground' : ''}`} onClick={() => setSelectedPaper('blank')}>Blank</p>
                <p className={`hover:cursor-pointer hover:text-accent mx-2 text-center text-sm ${selectedPaper === 'line1' ? 'text-muted-foreground' : ''}`} onClick={() => setSelectedPaper('line1')}>Line 1</p>
                <p className={`hover:cursor-pointer hover:text-accent mx-2 text-center text-sm ${selectedPaper === 'line2' ? 'text-muted-foreground' : ''}`} onClick={() => setSelectedPaper('line2')}>Line 2</p>
                <p className={`hover:cursor-pointer hover:text-accent mx-2 text-center text-sm ${selectedPaper === 'graph1' ? 'text-muted-foreground' : ''}`} onClick={() => setSelectedPaper('graph1')}>Graph 1</p>
                <p className={`hover:cursor-pointer hover:text-accent mx-2 text-center text-sm ${selectedPaper === 'graph2' ? 'text-muted-foreground' : ''}`} onClick={() => setSelectedPaper('graph2')}>Graph 2</p>
            </div>
            <div className={`
                ${selectedPaper === 'blank' ? blankPaper : ''}
                ${selectedPaper === 'line1' ? linePaper1 : ''}
                ${selectedPaper === 'line2' ? linePaper2 : ''}
                ${selectedPaper === 'graph1' ? graphPaper1 : ''}
                ${selectedPaper === 'graph2' ? graphPaper2 : ''}
                `}
            ></div>
        </>

    )
}
