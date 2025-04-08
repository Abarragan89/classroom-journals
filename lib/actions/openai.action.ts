"use server"
import { ResponseData } from "@/types";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

export async function gradeResponseWithAI(gradeLevel: string, responseData: ResponseData[]) {
    const systemPrompt = `
        You are a strict but fair grader. Grade the following answers based on a ${gradeLevel} grade level. 

        Return an array of scores (only numbers), one for each question in order.

        - Use only these values: 0 (wrong), 0.5 (partially correct), or 1 (fully correct)
        - Do not explain the answers
        - Accept spelling errors if the intent is clear
        - Accept any answer that is factually correct, even if it's not the most common one
        - Return null if you cannot understand the answer at all

        ONLY return the array of numbers like: [1, 0.5, 0]
    `
    const questions = responseData.map((r, i) => `${i + 1}. ${r.question}`).join('\n');
    const answers = responseData.map((r, i) => `${i + 1}. ${r.answer}`).join('\n');

    const response = await openai.responses.create({
        model: "gpt-4o-mini",
        instructions: `Grade the following answers on a ${gradeLevel} grade level using only one of these values: 0 (wrong), 0.5 (partial), or 1 (correct). Do not explain your reasoning. Reply with only the score. Return the scores of each question in an array in the order they were given. If you are unsure what the question is asking, return null. If the spelling is close enough to the acutal answer, mark it correct. 
        Questions: ${questions}`,
        input: [
            {
                "role": "system",
                "content": systemPrompt
            },
            {
                "role": "user",
                "content": `Questions:\n${questions}\n\nAnswers:\n${answers}`
            }
        ],
        text: {
            "format": {
                "type": "text"
            }
        },
        temperature: 0.2,
        max_output_tokens: 100,
    });
    return response
}


