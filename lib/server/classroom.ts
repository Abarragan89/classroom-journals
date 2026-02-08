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

// Get all Teacher Classes
export async function getAllClassrooms(teacherId: string) {
    const session = await requireAuth();
    if (session?.user?.id !== teacherId) {
        throw new Error("Forbidden");
    }
    const allClasses = await prisma.classroom.findMany({
        where: {
            users: {
                some: {
                    userId: teacherId,
                    role: ClassUserRole.TEACHER
                }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    })
    return allClasses
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
                    role: ClassUserRole.TEACHER
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

// Get a single Classroom
export async function getSingleClassroom(classroomId: string, teacherId: string) {
    const session = await requireAuth();
    if (session?.user?.id !== teacherId) {
        throw new Error('Forbidden')
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
