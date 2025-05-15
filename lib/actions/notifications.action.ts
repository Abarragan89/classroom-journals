"use server";
import { prisma } from "@/db/prisma";

export async function getUserNotifications(userId: string, classId: string) {
    try {
        const userNotifications = await prisma.notification.findMany({
            where: { userId, classId },
            select: {
                id: true,
                responseId: true,
                url: true,
                message: true,
                commentText: true,
                createdAt: true,
                isRead: true,
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 200
        });

        return userNotifications;
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

export async function getUnreadUserNotifications(userId: string, classId: string) {
    try {
        const notificationCount = await prisma.notification.count({
            where: { userId, isRead: false, classId },
        });
        return notificationCount;
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

export async function markAllNotificationsAsRead(userId: string, classId: string) {
    try {
        const notificationCount = await prisma.notification.updateMany({
            where: { userId, isRead: false, classId },
            data: {
                isRead: true,
            }
        });
        return notificationCount;
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
export async function clearAllNotifications(userId: string, classId: string) {
    try {
        if (!userId) {
            return { success: false, message: 'Missing user Id' }
        }
        await prisma.notification.deleteMany({
            where: { userId, classId }
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