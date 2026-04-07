import { Worker, Job } from 'bullmq'
import { connection } from '../lib/redis'
import OpenAI from 'openai'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

type RubricCategory = {
    name: string;
    criteria: {
        score: number;
        description: string;
    }[];
};

type ParseRubricResult = {
    success: boolean;
    title: string;
    categories: RubricCategory[];
};

async function parseRubricFile(job: Job): Promise<ParseRubricResult> {
    const { file_id } = job.data as { file_id: string; teacherId: string };

    const systemPrompt = `
        You are an expert at reading and extracting rubric data from documents.

        Your task is to extract a rubric from the provided document and return it as structured JSON.

        Rules:
        - Extract the rubric title (or infer a short descriptive title if none is present).
        - Extract every category/criterion row in the rubric.
        - For each category, extract every score level with its description.
        - Scores must be positive integers starting at 1 (e.g., 1, 2, 3, 4).
        - If the document uses a different scale (e.g., 0-3, 10-40), normalize to 1-based integers preserving the number of levels.
        - If descriptions are missing for a score level, use an empty string.
        - Do NOT include any explanation, markdown, or extra text — return only valid JSON.

        Return format:
        {
            "title": "string",
            "categories": [
                {
                    "name": "string",
                    "criteria": [
                        { "score": 1, "description": "string" },
                        { "score": 2, "description": "string" }
                    ]
                }
            ]
        }
    `.trim();

    let response;
    try {
        response = await openai.responses.create({
            model: 'gpt-5-nano',
            reasoning: { effort: 'medium' },
            instructions: systemPrompt,
            input: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'input_file',
                            file_id,
                        },
                        {
                            type: 'input_text',
                            text: 'Extract the rubric from this document and return it as JSON matching the required format.',
                        },
                    ],
                },
            ],
            text: {
                format: { type: 'json_object' },
            },
            max_output_tokens: 16000,
        });
    } catch (err) {
        // Clean up the file on API error, then re-throw
        openai.files.del(file_id).catch((cleanupErr: unknown) =>
            console.error(`Failed to clean up OpenAI file ${file_id}:`, cleanupErr)
        );
        throw err;
    }

    // Clean up the file after a successful response
    openai.files.del(file_id).catch((err: unknown) =>
        console.error(`Failed to clean up OpenAI file ${file_id}:`, err)
    );

    const outputText = response.output_text;
    if (!outputText) {
        throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(outputText) as { title: string; categories: RubricCategory[] };

    if (!parsed.title || !Array.isArray(parsed.categories) || parsed.categories.length === 0) {
        throw new Error('OpenAI returned an invalid rubric structure');
    }

    return {
        success: true,
        title: parsed.title,
        categories: parsed.categories,
    };
}

const worker = new Worker(
    'rubric-parse',
    async (job: Job) => {
        console.log(`Processing rubric-parse job ${job.id} of type ${job.name}`);

        try {
            if (job.name === 'parse-rubric-file') {
                return await parseRubricFile(job);
            } else {
                throw new Error(`Unknown job type: ${job.name}`);
            }
        } catch (error) {
            console.error(`Rubric parse job ${job.id} failed:`, error);
            throw error;
        }
    },
    {
        connection,
        concurrency: 3,
    }
);

worker.on('completed', (job) => {
    console.log(`Rubric parse job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
    console.error(`Rubric parse job ${job?.id} failed with error:`, err);
});

console.log('Rubric Parse Worker started and listening for jobs...');
