"use server"
import { prisma } from "@/db/prisma"
import { decryptText } from "../utils";

// add a comment to Response
export async function addComment(responseId: string, text: string, userId: string, sessionId: string) {
    
    try {
        if (!responseId || !text || !userId || !sessionId) {
            return { success: false, message: "Missing required fields" };
        }

        const result = await prisma.$transaction(async (prisma) => {
            // Create the new comment
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
            });

            // Get all users who have commented on the response (excluding the current user)
            const commenters = await prisma.comment.findMany({
                where: {
                    responseId,
                    userId: { not: userId } // Exclude the commenter to avoid self-notification
                },
                select: {
                    userId: true
                },
                distinct: ['userId'] // Get unique users
            });

            // Get the author of the response
            const response = await prisma.response.findUnique({
                where: { id: responseId },
                select: { studentId: true } // Author of response
            });

            const usersToNotify = new Set(commenters.map(c => c.userId)); // Unique user IDs
            if (response?.studentId && response.studentId !== userId) {
                usersToNotify.add(response.studentId); // Add response author if they aren't the commenter
            }

            // Decrypt username for the frontend response
            const formattedComment = {
                ...newComment,
                user: {
                    ...newComment.user,
                    username: decryptText(newComment.user.username as string, newComment.user.iv as string)
                }
            };

            // Create notifications for all users
            const notifications = Array.from(usersToNotify).map((notifyUserId) => {
                const isAuthor = notifyUserId === response?.studentId;
                const message = isAuthor
                    ? `${formattedComment.user.username} added a comment to your blog:`
                    : `${formattedComment.user.username} added to a blog you interacted with:`
                return {
                    url: `discussion-board/${sessionId}/response/${responseId}#comment-section-main`, // Notification link
                    userId: notifyUserId,
                    responseId,
                    message,
                    commentText: text
                };
            });

            await prisma.notification.createMany({ data: notifications });


            return formattedComment;
        });

        return result;
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

// export async function replyComment(responseId: string, parentId: string, text: string, userId: string) {
//     try {
//         if (!parentId || !text || !userId || !responseId) {
//             return { success: false, message: "Missing required fields" };
//         }
//         const newComment = await prisma.comment.create({
//             data: {
//                 responseId,
//                 parentId,
//                 text,
//                 userId
//             },
//             select: {
//                 user: {
//                     select: {
//                         username: true,
//                         iv: true,
//                     }
//                 },
//                 createdAt: true,
//                 id: true,
//                 text: true,
//                 likes: {
//                     select: {
//                         id: true,
//                         userId: true,
//                         commentId: true,
//                     }
//                 }
//             }
//         })

//         const formattedComment = {
//             ...newComment,
//             user: {
//                 ...newComment.user,
//                 username: decryptText(newComment.user.username as string, newComment.user.iv as string)
//             }
//         }

//         return formattedComment
//     } catch (error) {
//         if (error instanceof Error) {
//             console.log("Error fetching prompts:", error.message);
//             console.error(error.stack);
//         } else {
//             console.log("Unexpected error:", error);
//         }

//         return { success: false, message: "Error fetching prompts. Try again." };
//     }
// }


// Like a comment

export async function replyComment(responseId: string, parentId: string, text: string, userId: string, sessionId: string) {
    try {
        if (!parentId || !text || !userId || !responseId) {
            return { success: false, message: "Missing required fields" };
        }

        const result = await prisma.$transaction(async (prisma) => {
            // Create the new reply comment
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
            });

            // Get the parent comment owner (user being replied to)
            const parentComment = await prisma.comment.findUnique({
                where: { id: parentId },
                select: { userId: true }
            });

            // Get all unique users who have commented on the response (excluding the current user)
            const commenters = await prisma.comment.findMany({
                where: {
                    responseId,
                    userId: { not: userId } // Exclude the replier to avoid self-notification
                },
                select: {
                    userId: true
                },
                distinct: ['userId'] // Get unique users
            });

            // Get the author of the response
            const response = await prisma.response.findUnique({
                where: { id: responseId },
                select: { studentId: true } // Author of response
            });

            const usersToNotify = new Set(commenters.map(c => c.userId));

            // Add the parent comment owner to notify if it's not the replier
            if (parentComment?.userId && parentComment.userId !== userId) {
                usersToNotify.add(parentComment.userId);
            }

            // Add the response author if they aren’t the replier or parent comment owner
            if (response?.studentId && response.studentId !== userId) {
                usersToNotify.add(response.studentId);
            }

            // Decrypt username for the frontend response
            const formattedComment = {
                ...newComment,
                user: {
                    ...newComment.user,
                    username: decryptText(newComment.user.username as string, newComment.user.iv as string)
                }
            };

            // Create notifications for all users
            const notifications = Array.from(usersToNotify).map((notifyUserId) => {
                let message = `${formattedComment.user.username} commented on a blog you interacted with:`;

                if (notifyUserId === response?.studentId) {
                    message = `${formattedComment.user.username} added a reply to your blog:`;
                } else if (notifyUserId === parentComment?.userId) {
                    message = `${formattedComment.user.username} replied to your comment:`;
                }

                return {
                    url: `discussion-board/${sessionId}/response/${responseId}#comment-section-main`, // Notification link
                    userId: notifyUserId,
                    responseId,
                    message,
                    commentText: text
                };
            });

            await prisma.notification.createMany({ data: notifications });

            return formattedComment;
        });

        return result;
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error replying to comment:", error.message);
            console.error(error.stack);
        } else {
            console.log("Unexpected error:", error);
        }

        return { success: false, message: "Error replying to comment. Try again." };
    }
}


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