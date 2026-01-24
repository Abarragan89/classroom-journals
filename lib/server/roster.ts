import { requireAuth } from "../actions/authorization.action";
import { decryptText } from "../utils";
import { prisma } from "@/db/prisma";

// Get single student information for Student Profile
export async function getSingleStudentInformation(studentId: string, classId: string) {
    const session = await requireAuth();
    if (session?.user?.id !== studentId || session?.classroomId !== classId) {
        throw new Error('Forbidden')
    }

    if (typeof classId !== 'string') {
        throw new Error('Missing or invalid classId');
    }

    const studentInfo = await prisma.user.findUnique({
        where: { id: studentId },
        select: {
            id: true,
            username: true,
            name: true,
            iv: true,
            avatarURL: true,
        }
    });

    if (!studentInfo) {
        throw new Error('Student not found');
    }

    const decryptedStudentInfo = {
        ...studentInfo,
        username: decryptText(studentInfo.username as string, studentInfo.iv as string),
        name: decryptText(studentInfo.name as string, studentInfo.iv as string),
        iv: null
    };

    return {
        studentInfo: decryptedStudentInfo,
    };
}