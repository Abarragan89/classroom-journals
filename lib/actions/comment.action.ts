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
                likes: {
                    select: {
                        id: true,
                        userId: true,
                        commentId: true,
                    }
                }
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

export async function replyComment(responseId: string, parentId: string, text: string, userId: string) {
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
                likes: {
                    select: {
                        id: true,
                        userId: true,
                        commentId: true,
                    }
                }
            }
        })

        const formattedComment = {
            ...newComment,
            user: {
                ...newComment.user,
                username: decryptText(newComment.user.username as string, newComment.user.iv as string)
            }
        }
        console.log("formated in the server ", formattedComment)
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


// Like a comment
export async function toggleCommentLike(commentId: string, userId: string) {
    try {

        await prisma.$transaction(async (prisma) => {
            // Check if the user has already liked the comment
            const existingLike = await prisma.commentLike.findUnique({
                where: { userId_commentId: { userId, commentId } }
            });

            if (!existingLike) {
                // Add a new like if not already liked
                await prisma.commentLike.create({
                    data: {
                        userId,
                        commentId
                    }
                });

                // Update the comment's likes
                await prisma.comment.update({
                    where: { id: commentId },
                    data: { likeCount: { increment: 1 } }
                });
            } else if (existingLike) {
                // Remove the like if the user is unliking the comment
                await prisma.commentLike.delete({
                    where: { userId_commentId: { userId, commentId } }
                });

                // Decrement the likes on the comment
                await prisma.comment.update({
                    where: { id: commentId },
                    data: { likeCount: { decrement: 1 } }
                });
            }
        });
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