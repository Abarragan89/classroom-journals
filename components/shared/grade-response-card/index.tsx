import GradingPanel from "@/components/grading-panel"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ResponseData } from "@/types"

export default function GradeResponseCard({
    questionsAndAnswers,
    responseId,
}: {
    questionsAndAnswers: ResponseData[],
    responseId: string,
}) {

    function renderScoreUIText(score: number) {
        switch (score) {
            case 0:
                return (
                    <span className="text-destructive font-bold ml-1">Incorrect</span>
                );
            case 0.5:
                return (
                    <span className="text-warning font-bold ml-1">Half Credit</span>
                );
            case 1:
                return (
                    <span className="text-success font-bold ml-1">Correct</span>
                );
            default:
                return (
                    <span className="font-bold ml-1">Not Graded</span>
                );
        }
    }

    return (
        <>
            <div className="mt-8 flex flex-wrap justify-start gap-10">
                {questionsAndAnswers?.length > 0 && questionsAndAnswers.map((responseData: ResponseData, index: number) => (
                    <Card className='w-full p-4 space-y-2 max-w-[500px] mx-auto' key={index}>
                        <div className="flex-between text-sm">
                            <p className='ml-2'> Marked As:
                                {renderScoreUIText(responseData.score)}
                            </p>
                            <GradingPanel
                                currentScore={responseData.score}
                                responseId={responseId}
                                questionNumber={index}
                            />
                        </div>
                        <Separator />
                        <CardTitle className='p-2 py-3 leading-snug text-center font-normal italic'>{responseData.question}</CardTitle>
                        <CardContent className='p-3 pt-0'>
                            <p className='ml-1 mb-1 text-sm font-bold'>Answer:</p>
                            <div className='bg-background px-2 py-4 m-0 rounded-md'>
                                {responseData.answer}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    )
}
