"use server"
import { prisma } from "@/db/prisma"
import { decryptText } from "../utils";
import { ClassUserRole } from "@prisma/client";
import { requireAuth } from "./authorization.action";

// add a comment to Response
export async function addComment(
    responseId: string,
    text: string,
    userId: string,
    sessionId: string,
    classroomId: string
) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== userId) {
            throw new Error('Forbidden')
        }
        if (!responseId || !text || !userId || !sessionId) {
            return { success: false, message: "Missing required fields" };
        }

        const result = await prisma.$transaction(async (prisma) => {
            // Get teacher Id
            const teacherData = await prisma.classUser.findFirst({
                where: { classId: classroomId, role: ClassUserRole.TEACHER },
                select: {
                    user: {
                        select: {
                            id: true,
                        }
                    }
                }
            })

            const teacherId = teacherData?.user?.id as string

            // Create the new comment
            const newComment = await prisma.comment.create({
                data: {
                    responseId,
                    text: text.trim(),
                    userId
                },
                select: {
                    user: {
                        select: {
                            username: true,
                            iv: true,
                            avatarURL: true,
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
            // Add Teacher id so they get all notifications
            usersToNotify.add(teacherId)

            // Decrypt username for the frontend response
            const formattedComment = {
                ...newComment,
                user: {
                    avatarURL: newComment?.user?.avatarURL,
                    username: decryptText(newComment.user.username as string, newComment.user.iv as string)
                }
            };

            // Create notifications for all users
            const notifications = Array.from(usersToNotify).map((notifyUserId) => {
                const isAuthor = notifyUserId === response?.studentId;
                const isTeacher = teacherId === notifyUserId
                let message: string = '';
                let notificationLink: string = '';
                if (isTeacher) {
                    message = `${formattedComment.user.username} added the following comment:`
                    notificationLink = `/classroom/${classroomId}/${teacherId}/single-prompt-session/${sessionId}/single-response/${responseId}#comment-section-main`
                } else if (!isAuthor) {
                    message = `${formattedComment.user.username} added to a blog you interacted with:`
                    notificationLink = `/discussion-board/${sessionId}/response/${responseId}#comment-section-main`
                } else if (isAuthor) {
                    notificationLink = `/discussion-board/${sessionId}/response/${responseId}#comment-section-main`
                    message = `${formattedComment.user.username} added a comment to your blog:`
                }
                return {
                    url: notificationLink,
                    userId: notifyUserId,
                    responseId,
                    message,
                    classId: classroomId,
                    commentText: text
                };
            });

            await prisma.notification.createMany({ data: notifications });
            return formattedComment;
        });

        return result;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error adding comments:", error.message);
            console.error(error.stack);
            return { success: false, message: "Error fetching prompts. Try again.", error: error.message };
        } else {
            console.error("Unexpected error:", error);
            return { success: false, message: "Error fetching prompts. Try again." };
        }

    }
}

export async function replyComment(
    responseId: string,
    parentId: string,
    text: string,
    userId: string,
    sessionId: string,
    classroomId: string
) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== userId) {
            throw new Error('Forbidden')
        }
        if (!parentId || !text || !userId || !responseId) {
            return { success: false, message: "Missing required fields" };
        }

        const result = await prisma.$transaction(async (prisma) => {
            // Get teacher Id
            const teacherData = await prisma.classUser.findFirst({
                where: { classId: classroomId, role: ClassUserRole.TEACHER },
                select: {
                    user: {
                        select: {
                            id: true,
                        }
                    }
                }
            })

            const teacherId = teacherData?.user?.id as string;

            // Create the new reply comment
            const newComment = await prisma.comment.create({
                data: {
                    responseId,
                    parentId,
                    text: text.trim(),
                    userId
                },
                select: {
                    user: {
                        select: {
                            username: true,
                            iv: true,
                            avatarURL: true
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
            // Add Teacher id so they get all notifications
            usersToNotify.add(teacherId)

            // Decrypt username for the frontend response
            const formattedComment = {
                ...newComment,
                user: {
                    avatarURL: newComment?.user?.avatarURL,
                    username: decryptText(newComment.user.username as string, newComment.user.iv as string)
                }
            };

            // Create notifications for all users
            const notifications = Array.from(usersToNotify).map((notifyUserId) => {
                let message = `${formattedComment.user.username} commented on a blog you interacted with:`;
                let notificationLink: string = '';

                if (notifyUserId === response?.studentId) {
                    message = `${formattedComment.user.username} added a reply to your blog:`;
                    notificationLink = `/discussion-board/${sessionId}/response/${responseId}#comment-section-main`
                } else if (notifyUserId === parentComment?.userId) {
                    message = `${formattedComment.user.username} replied to your comment:`;
                    notificationLink = `/discussion-board/${sessionId}/response/${responseId}#comment-section-main`
                } else if (teacherId === notifyUserId) {
                    message = `${formattedComment.user.username} added the following comment:`
                    notificationLink = `/classroom/${classroomId}/${teacherId}/single-prompt-session/${sessionId}/single-response/${responseId}#comment-section-main`
                }

                return {
                    url: notificationLink,
                    userId: notifyUserId,
                    responseId,
                    message,
                    classId: classroomId,
                    commentText: text
                };
            });

            await prisma.notification.createMany({ data: notifications });
            return formattedComment
        });

        return result;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error replying to comment:", error.message);
            console.error(error.stack);
            return { success: false, message: "Error fetching prompts. Try again.", error: error.message };
        } else {
            console.error("Unexpected error:", error);
        }
        return { success: false, message: "Error replying to comment. Try again." };
    }
}


export async function toggleCommentLike(commentId: string, userId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== userId) {
            throw new Error('Forbidden')
        }
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
            console.error("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.error("Unexpected error:", error);
        }

        return { success: false, message: "Error fetching prompts. Try again." };
    }
}

// Delete a comment
export async function deleteComment(commentId: string, teacherId: string) {
    try {
        const session = await requireAuth();
        if (session?.user?.id !== teacherId) {
            throw new Error('Forbidden')
        }

        if (!commentId) {
            throw new Error('comment id is required')
        }

        await prisma.comment.delete({
            where: { id: commentId }
        })

        return { success: true, message: "comment deleted" };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching prompts:", error.message);
            console.error(error.stack);
        } else {
            console.error("Unexpected error:", error);
        }
        return { success: false, message: "Error fetching prompts. Try again." };
    }
}