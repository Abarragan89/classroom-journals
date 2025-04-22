"use server"
import { ResponseData } from "@/types";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

// export async function gradeResponseWithAI(gradeLevel: string, responseData: ResponseData[]) {
//     let gradeLevelString = 'You are an expert teacher in all grade levels. Grade the following answers.'
//     if (gradeLevel) {
//         gradeLevelString = `You are an expert teacher in all grade levels. Grade the following answers based on a ${gradeLevel} grade level. `
//     }
//     const systemPrompt = `
//         ${gradeLevelString} 

//         Return an array of scores (only numbers), one for each question in order.

//         - Use only these values: 0 (wrong), 0.5 (partially correct), or 1 (fully correct)
//         - Do not explain the answers
//         - Accept spelling errors if the intent is clear
//         - Accept any answer that is factually correct, even if it's not the most common one
//         - Return null if you cannot understand the answer or question

//         ONLY return the array of numbers like: [1, 0.5, 0]
//     `
//     const questions = responseData.map((r, i) => `${i + 1}. ${r.question}`).join('\n');
//     const answers = responseData.map((r, i) => `${i + 1}. ${r.answer}`).join('\n');

//     const response = await openai.responses.create({
//         model: "gpt-4o-mini",
//         instructions: `${systemPrompt}, 
//         Questions: ${questions}`,
//         input: `Questions:\n${questions}\n\nAnswers:\n${answers}`,
//         text: {
//             "format": {
//                 "type": "text"
//             }
//         },
//         temperature: 0.2,
//         max_output_tokens: 100,
//     });
//     return response
// }

export async function gradeResponseWithAI(gradeLevel: string, responseData: ResponseData[]) {
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
        temperature: 0.2,
        max_output_tokens: 100,
    });

    return response;
}


