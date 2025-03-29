"use client"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Response, ResponseData } from "@/types"

const chartConfig = {
    correct: {
        label: "Correct",
        color: "var(--success)",
    },
    half: {
        label: "Half",
        color: "var(--warning)"

    },
    wrong: {
        label: "Wrong",
        color: "var(--destructive)"

    },
} satisfies ChartConfig


export function StudentDataBarChart({
    responses
}: {
    responses: Response[]
}) {

    // Populate the chart data with the questions first
    let chartData = [...(responses[0]?.response as unknown as ResponseData[]).map((response: ResponseData, index: number) => {
        return (
            {
                question: `Question ${index + 1}`,
                correct: 0,
                half: 0,
                wrong: 0,
            }
        )
    })]

    // add scores to the chart data
    responses.forEach((response) => (response?.response as unknown as ResponseData[])?.forEach((responseData: ResponseData, index: number) => {
        if (responseData.score === 0) {
            chartData[index].wrong += 1
        } else if (responseData.score === 0.5) {
            chartData[index].half += 1
        } else if (responseData.score === 1) {
            chartData[index].correct += 1

        }
    }))

    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] max-w-[500px] mt-10">
            <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="question"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="correct" fill="var(--color-correct)" radius={2} />
                <Bar dataKey="half" fill="var(--color-half)" radius={2} />
                <Bar dataKey="wrong" fill="var(--color-wrong)" radius={2} />
            </BarChart>
        </ChartContainer>
    )
}