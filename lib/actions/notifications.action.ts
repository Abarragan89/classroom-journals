"use server";

import { prisma } from "@/db/prisma";
import { decryptText } from "../utils";

export async function getUserNotifications(userId: string) {
    try {
        const userNotifications = await prisma.notification.findMany({
            where: { userId },
            select: {
                id: true,
                responseId: true,
                url: true,
                message: true,
                commentText: true,
                createdAt: true,
                isRead: true,
                user: {
                    select: {
                        iv: true,
                        username: true,
                    }
                }
            }
        });

        // Decrypt each user's name and attach it to the notification object
        const notificationsWithDecryptedNames = userNotifications.map(notification => ({
            ...notification,
            user: {
                username: decryptText(notification.user.username as string, notification.user.iv as string)
            }
        }));

        return notificationsWithDecryptedNames;
    } catch (error) {
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }
        return { success: false, message: 'Error updating student. Try again.' }
    }
}

// Clear all user Notifications
export async function clearAllNotifications(userId: string) {
    try {
        if (!userId) {
            return { success: false, message: 'Missing user Id' }
        }
        await prisma.notification.deleteMany({
            where: { userId }
        })
        return { success: false, message: 'All notifications deleted' }
    } catch (error) {
        if (error instanceof Error) {
            console.log('Error creating new prompt:', error.message);
            console.error(error.stack); // Log stack trace for better debugging
        } else {
            console.log('Unexpected error:', error);
        }
        return { success: false, message: 'Error updating student. Try again.' }
    }
}