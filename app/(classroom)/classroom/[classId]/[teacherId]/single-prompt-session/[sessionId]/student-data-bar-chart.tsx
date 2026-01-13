"use client"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Response, ResponseData } from "@/types"
import { BiChevronLeft, BiChevronRight } from "react-icons/bi"

const chartConfig = {
    correct: {
        label: "Correct",
        color: "var(--success)",
    },
    half: {
        label: "Half Credit",
        color: "var(--warning)"

    },
    wrong: {
        label: "Incorrect",
        color: "var(--destructive)"

    },
} satisfies ChartConfig


export function StudentDataBarChart({
    responses,
    startRange,
    endRange,
    onNext,
    onPrevious,
    totalQuestions
}: {
    responses: Response[];
    startRange: number;
    endRange: number;
    onNext: () => void;
    onPrevious: () => void;
    totalQuestions: number;
}) {

    const responseArray = (responses[0]?.response ?? []) as unknown as ResponseData[];

    // Populate the chart data with the questions first
    const chartData = responseArray
        .slice(startRange, endRange)
        .map((response: ResponseData, index: number) => ({
            question: `Q${startRange + index + 1}`,
            correct: 0,
            half: 0,
            wrong: 0,
        }));

    // add scores to the chart data
    responses.forEach((response) => (response?.response as unknown as ResponseData[])?.slice(startRange, endRange)?.forEach((responseData: ResponseData, index: number) => {
        if (responseData.score === 0) {
            chartData[index].wrong += 1
        } else if (responseData.score === 0.5) {
            chartData[index].half += 1
        } else if (responseData.score === 1) {
            chartData[index].correct += 1

        }
    }))

    // Calculate totals for summary
    const totals = chartData.reduce(
        (acc, item) => ({
            correct: acc.correct + item.correct,
            half: acc.half + item.half,
            wrong: acc.wrong + item.wrong,
        }),
        { correct: 0, half: 0, wrong: 0 }
    );
    const totalResponses = totals.correct + totals.half + totals.wrong;

    const chevronStyles = 'hover:cursor-pointer hover:text-input border border-border rounded-sm hover:bg-primary hover:text-foreground p-1 transition-colors';
    const canGoBack = startRange > 0;
    const canGoNext = endRange < totalQuestions;

    return (
        <div className="border border-border rounded-lg p-4 bg-card">
            {/* Header Section */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg">Score Distribution</h3>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">
                            Questions {startRange + 1} - {endRange}
                        </span>
                        <button
                            onClick={onPrevious}
                            disabled={!canGoBack}
                            className={`${chevronStyles} ${!canGoBack ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                            <BiChevronLeft size={20} />
                        </button>
                        <button
                            onClick={onNext}
                            disabled={!canGoNext}
                            className={`${chevronStyles} ${!canGoNext ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                            <BiChevronRight size={20} />
                        </button>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">Visual breakdown of student performance per question</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-border">
                <div className="text-center p-2 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-2xl font-bold text-success">{totals.correct}</p>
                    <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-2xl font-bold text-warning">{totals.half}</p>
                    <p className="text-xs text-muted-foreground">Half Credit</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-2xl font-bold text-destructive">{totals.wrong}</p>
                    <p className="text-xs text-muted-foreground">Incorrect</p>
                </div>
            </div>

            {/* Chart */}
            <ChartContainer config={chartConfig} className="min-h-[250px] sm:min-h-[300px]">
                <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                        dataKey="question"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="correct" fill="var(--color-correct)" radius={4} />
                    <Bar dataKey="half" fill="var(--color-half)" radius={4} />
                    <Bar dataKey="wrong" fill="var(--color-wrong)" radius={4} />
                </BarChart>
            </ChartContainer>
        </div>
    )
}