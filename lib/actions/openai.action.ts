"use server"
import { ResponseData } from "@/types";
import OpenAI from "openai";
import { requireAuth } from "./authorization.action";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

export async function gradeResponseWithAI(gradeLevel: string, responseData: ResponseData[]) {
    try {
        await requireAuth();
        const gradeLevelString = gradeLevel
            ? `You are an expert teacher. Grade each answer according to a ${gradeLevel} level.`
            : `You are an expert teacher. Grade each answer appropriately based on general educational standards.`

        const systemPrompt = `
            ${gradeLevelString}
    
            Your task is to score student responses based on the correctness of their answers.
    
            Follow these strict rules when assigning scores:
            - Use only the values: 1 (fully correct), 0.5 (partially correct), or 0 (incorrect)
            - If the answer is factually correct, accept it even if it is unconventional
            - If the spelling is close but the intent is clear, accept the answer
            - Return the JavaScript value null if the you cannot answer the question, or the question or answer is unclear or unintelligible
            - **Do not** include explanations, comments, or extra output
            - Your response should ONLY be an array of numbers, e.g.,: [1, 0.5, 0]
    
            Grade the following:
        `

        const questions = responseData.map((r, i) => `${i + 1}. ${r.question}`).join('\n');
        const answers = responseData.map((r, i) => `${i + 1}. ${r.answer}`).join('\n');

        const response = await openai.responses.create({
            model: "gpt-4o-mini",
            instructions: systemPrompt.trim(),
            input: [
                {
                    role: "user",
                    content: `Questions:\n${questions}\n\nAnswers:\n${answers}`
                }
            ],
            text: {
                format: { type: "text" }
            },
            temperature: 0.0,
            max_output_tokens: 300,
        });
        return response;

    } catch (error) {
        console.log('error wiht open ai autograde ', error)
        return { output_text: 'error' }
    }
}


