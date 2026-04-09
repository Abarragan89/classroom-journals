"use server";
import { requireAuth } from "./authorization.action";
import { rubricParseQueue, rubricParseQueueEvents } from "@/lib/queues";
import { createRubric, updateRubric } from "./rubric.actions";
import { Rubric } from "@/types";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SUPPORTED_MIME_TYPES = new Set([
    "application/pdf",
    "application/msword",                                                                          // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",                    // .docx
    "text/csv",                                                                                    // .csv
    "application/vnd.ms-excel",                                                                    // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",                          // .xlsx
    "application/vnd.oasis.opendocument.text",                                                    // .odt
    "application/rtf",                                                                             // .rtf
    "text/rtf",                                                                                    // .rtf (alternate)
    "text/plain",                                                                                  // .txt
    "application/vnd.apple.pages",                                                                 // .pages
    "image/jpeg",                                                                                  // .jpg/.jpeg
    "image/png",                                                                                   // .png
    "image/webp",                                                                                  // .webp
    "image/gif",                                                                                   // .gif
]);

const IMAGE_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

export async function parseAndSaveRubricFromFile(
    formData: FormData,
    rubricId?: string
): Promise<{ success: boolean; rubric?: Rubric; message?: string }> {
    let file_id: string | null = null;

    try {
        const session = await requireAuth();
        const teacherId = session?.user?.id;
        if (!teacherId) {
            return { success: false, message: "Authentication required" };
        }

        const file = formData.get("file") as File | null;
        if (!file) {
            return { success: false, message: "No file provided" };
        }

        if (!SUPPORTED_MIME_TYPES.has(file.type)) {
            return {
                success: false,
                message: "Unsupported file type. Please upload a PDF, DOCX, or CSV.",
            };
        }

        // Upload file to OpenAI Files API
        const uploadedFile = await openai.files.create({
            file: new File([await file.arrayBuffer()], file.name, { type: file.type }),
            purpose: "user_data",
        });
        file_id = uploadedFile.id;

        // Enqueue parse job and wait for result
        const isImage = IMAGE_MIME_TYPES.has(file.type);
        const job = await rubricParseQueue.add("parse-rubric-file", {
            file_id,
            teacherId,
            isImage,
        });

        const result = await job.waitUntilFinished(rubricParseQueueEvents) as {
            success: boolean;
            title: string;
            categories: { name: string; criteria: { score: number; description: string }[] }[];
        };

        if (!result?.success) {
            throw new Error("Worker failed to parse rubric");
        }

        // Save (create or update)
        let savedResult: { success: boolean; rubric?: unknown } | null = null;
        if (rubricId) {
            savedResult = await updateRubric(rubricId, result.categories as any, result.title);
        } else {
            savedResult = await createRubric(teacherId, result.categories as any, result.title);
        }

        if (!savedResult?.success || !savedResult?.rubric) {
            return { success: false, message: "Failed to save rubric" };
        }

        return { success: true, rubric: savedResult.rubric as Rubric };
    } catch (error) {
        // Clean up OpenAI file if the job was never queued or save failed
        if (file_id) {
            openai.files.del(file_id).catch((err: unknown) =>
                console.error(`Failed to clean up OpenAI file ${file_id}:`, err)
            );
        }
        console.error("Error parsing rubric from file:", error);
        return { success: false, message: "Failed to parse rubric. Please try again." };
    }
}
