import { ClassUserRole } from "@prisma/client";
import { requireAuth } from "../actions/authorization.action";
import { prisma } from "@/db/prisma";
import { decryptText } from "../utils";

// Get all Students in a classroom 
export async function getAllStudents(classId: string, teacherId: string) {
    const session = await requireAuth();

    if (session?.user?.id !== teacherId) {
        throw new Error('Forbidden')
    }

    const allStudents = await prisma.classUser.findMany({
        where: {
            classId: classId,
            role: ClassUserRole.STUDENT
        },
        select: {
            user: {
                select: {
                    id: true,
                    name: true, // Encrypted name
                    iv: true,
                    updatedAt: true,
                    username: true,
                    password: true,
                    commentCoolDown: true,
                }
            }
        }
    });

    // Decrypt each student's name
    const decryptedStudents = allStudents
        .filter(studentObj => studentObj.user) // Ensure user exists
        .map(({ user }) => ({ // Destructure `user` from `studentObj`
            id: user.id,
            updatedAt: user.updatedAt,
            commentCoolDown: user.commentCoolDown,
            username: decryptText(user.username as string, user.iv as string),
            password: decryptText(user.password as string, user.iv as string),
            name: decryptText(user.name as string, user.iv as string) // Decrypt name
        }));
    return decryptedStudents
}

// Get all Teacher Classes (owned + co-taught)
export async function getAllClassrooms(teacherId: string) {
    const session = await requireAuth();
    if (session?.user?.id !== teacherId) {
        throw new Error("Forbidden");
    }
    const classUsers = await prisma.classUser.findMany({
        where: {
            userId: teacherId,
            role: { in: [ClassUserRole.TEACHER, ClassUserRole.CO_TEACHER] }
        },
        select: {
            role: true,
            class: true
        },
        orderBy: { class: { updatedAt: 'desc' } }
    });
    return classUsers.map(({ role, class: cls }) => ({
        ...cls,
        isCoTeacher: role === ClassUserRole.CO_TEACHER
    }));
}

// Get all Teacher Classes
export async function getAllClassroomIds(teacherId: string) {
    const session = await requireAuth();
    if (session?.user?.id !== teacherId) {
        throw new Error("Forbidden");
    }
    const allClasses = await prisma.classroom.findMany({
        where: {
            users: {
                some: {
                    userId: teacherId,
                    role: { in: [ClassUserRole.TEACHER, ClassUserRole.CO_TEACHER] }
                }
            }
        },
        select: {
            id: true,
            name: true,
            updatedAt: true,
            _count: {
                select: {
                    users: {
                        where: {
                            role: ClassUserRole.STUDENT
                        }
                    }
                }
            }
        },

        orderBy: {
            updatedAt: 'desc'
        }
    })
    return allClasses
}

// Get a single Classroom (accessible to TEACHER and CO_TEACHER)
export async function getSingleClassroom(classroomId: string, teacherId: string) {
    const session = await requireAuth();
    if (session?.user?.id !== teacherId) {
        throw new Error('Forbidden')
    }
    // Verify the user is a member of this class (TEACHER or CO_TEACHER)
    const membership = await prisma.classUser.findUnique({
        where: { userId_classId: { userId: teacherId, classId: classroomId } },
        select: { role: true }
    });
    if (!membership || membership.role === ClassUserRole.STUDENT) {
        return null;
    }
    const classroom = await prisma.classroom.findUnique({
        where: { id: classroomId },
        select: {
            id: true,
            name: true,
            classCode: true,
            year: true,
            period: true,
            subject: true,
            grade: true,
            color: true,
            _count: {
                select: {
                    users: true,
                }
            }
        }
    })
    return classroom
}

// Get the ClassUserRole for a specific user in a specific class, or null if not a member
export async function getClassUserRole(classId: string, userId: string): Promise<ClassUserRole | null> {
    await requireAuth();
    const classUser = await prisma.classUser.findUnique({
        where: { userId_classId: { userId, classId } },
        select: { role: true }
    });
    return classUser?.role ?? null;
}

// Find a teacher account by their email address
export async function findTeacherByEmail(email: string) {
    await requireAuth();
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, username: true, email: true, iv: true }
    });
    return {
        ...user,
        name: user?.name ? decryptText(user.name, user.iv as string) : null,
        username: user?.username ? decryptText(user.username, user.iv as string) : null,
    };
}

// Get all co-teachers for a class
export async function getCoTeachersInClass(classId: string) {
    await requireAuth();
    const coTeachers = await prisma.classUser.findMany({
        where: { classId, role: ClassUserRole.CO_TEACHER },
        select: {
            user: {
                select: { id: true, name: true, username: true, email: true, iv: true }
            }
        }
    });
    return coTeachers.map(({ user }) => ({
        ...user,
        name: user?.name ? decryptText(user.name, user.iv as string) : null,
        username: user?.username ? decryptText(user.username, user.iv as string) : null,
    }));
}
