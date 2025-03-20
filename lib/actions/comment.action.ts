"use server"
import { prisma } from "@/db/prisma"
import { decryptText } from "../utils";

// add a comment to Response
export async function addComment(responseId: string, text: string, userId: string) {
    try {

        if (!responseId || !text || !userId) {
            return { success: false, message: "Missing required fields" };
        }
        const newComment = await prisma.comment.create({
            data: {
                responseId,
                text,
                userId
            },
            select: {
                user: {
                    select: {
                        username: true,
                        iv: true,
                    }
                },
                createdAt: true,
                id: true,
                text: true,
            }
        })

        const formattedComment = {
            ...newComment,
            user: {
                ...newComment.user,
                username: decryptText(newComment.user.username as string, newComment.user.iv as string)
            }
        }

        return formattedComment
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }

        return { success: false, message: "Error fetching prompts. Try again." };
    }
}

export async function replyComment(responseId:string, parentId: string, text: string, userId: string) {
    try {
        if (!parentId || !text || !userId || !responseId) {
            return { success: false, message: "Missing required fields" };
        }
        const newComment = await prisma.comment.create({
            data: {
                responseId,
                parentId,
                text,
                userId
            },
            select: {
                user: {
                    select: {
                        username: true,
                        iv: true,
                    }
                },
                createdAt: true,
                id: true,
                text: true,
            }
        })

        const formattedComment = {
            ...newComment,
            user: {
                ...newComment.user,
                username: decryptText(newComment.user.username as string, newComment.user.iv as string)
            }
        }

        return formattedComment
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }

        return { success: false, message: "Error fetching prompts. Try again." };
    }
}