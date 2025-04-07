"use server"
import { ResponseData } from "@/types";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

export async function gradeResponseWithAI(gradeLevel: string, responseData: ResponseData[]) {
    const questions = responseData.map(response => {
        return `1. ${response.question}`
    })
    const answers = responseData.map(response => {
        return `1. ${response.answer}`
    })
    const response = await openai.responses.create({
        model: "gpt-4o-mini",
        input: [
            {
                "role": "system",
                "content": [
                    {
                        "type": "input_text",
                        "text": `
                        Grade the following answers on a ${gradeLevel} grade level using only one of these values: 0 (wrong), 0.5 (partial), or 1 (correct). Do not explain your reasoning. Reply with only the score. Return the scores of each question in a array in the order they were given. If you do not know the answer to the question, return undefined. 
                        Questions: ${questions}
                        Answers: ${answers}
                        : 
                        `
                    }
                ]
            }
        ],
        text: {
            "format": {
                "type": "text"
            }
        },
        reasoning: {},
        tools: [],
        temperature: 0,
        max_output_tokens: 16,
        top_p: 1,
        store: true
    });

    return response
}


