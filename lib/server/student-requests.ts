import { ClassUserRole, StudentRequestStatus, StudentRequestType } from "@prisma/client";
import { requireAuth } from "../actions/authorization.action";
import { decryptText } from "../utils";
import { prisma } from "@/db/prisma";

// These requests are for the teacher to see
export async function getTeacherRequests(teacherId: string, classId: string) {
    const session = await requireAuth();
    const sessionUserId = session?.user?.id as string;
    // Allow TEACHER or CO_TEACHER in this class
    const membership = await prisma.classUser.findUnique({
        where: { userId_classId: { userId: sessionUserId, classId } },
        select: { role: true }
    });
    if (!membership || (membership.role !== ClassUserRole.TEACHER && membership.role !== ClassUserRole.CO_TEACHER)) {
        throw new Error("Forbidden");
    }
    const teacherRequests = await prisma.studentRequest.findMany({
        where: {
            classId
        },
        include: {
            student: {
                select: {
                    username: true,
                    iv: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    const decyptedTeacherRequests = teacherRequests.map((studentRequest) => {
        if (studentRequest.type === StudentRequestType.USERNAME) {
            return ({
                ...studentRequest,
                text: studentRequest.text,
                displayText: decryptText(studentRequest.text as string, studentRequest.student.iv as string),
                student: {
                    username: decryptText(studentRequest.student.username as string, studentRequest.student.iv as string),
                    id: true,
                }
            })
        } else {
            return ({
                ...studentRequest,
                student: {
                    username: decryptText(studentRequest.student.username as string, studentRequest.student.iv as string),
                    id: true,
                }
            })
        }
    })
    return decyptedTeacherRequests;
}

// This is for the teacher to get notifications if there are requests, work as notifications
export async function getStudentRequestCount(teacherId: string, classId: string) {
    const session = await requireAuth();
    const sessionUserId = session?.user?.id as string;
    // Allow TEACHER or CO_TEACHER in this class
    const membership = await prisma.classUser.findUnique({
        where: { userId_classId: { userId: sessionUserId, classId } },
        select: { role: true }
    });
    if (!membership || (membership.role !== ClassUserRole.TEACHER && membership.role !== ClassUserRole.CO_TEACHER)) {
        throw new Error("Forbidden");
    }
    const count = await prisma.studentRequest.count({
        where: { classId, status: StudentRequestStatus.PENDING },
    });

    return count;
}