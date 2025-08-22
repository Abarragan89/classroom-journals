import { requireAuth } from "../actions/authorization.action";
import { prisma } from "@/db/prisma";
import { decryptText } from "../utils";
import { ClassUserRole, TeacherAccountType } from "@prisma/client";

export async function getUserAvatarURL(userId: string) {
    const session = await requireAuth();
    if (session?.user?.id !== userId) {
        throw new Error('Forbidden');
    }

    const userInfo = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            avatarURL: true,
            iv: true,
            username: true,
        }
    });

    const decryptedUserInfo = {
        avatarURL: userInfo?.avatarURL,
        username: decryptText(userInfo?.username as string, userInfo?.iv as string)
    };
    console.log('decrypted user ', decryptedUserInfo)
    return decryptedUserInfo;
}

export async function getTeacherAccountData(teacherId: string) {
    const session = await requireAuth();
    if (session?.user?.id !== teacherId) {
        throw new Error('Forbidden');
    }

    const teacherData = await prisma.user.findUnique({
        where: { id: teacherId },
        select: {
            username: true,
            name: true,
            iv: true,
            email: true,
            accountType: true,
            avatarURL: true,
            id: true,
            image: true,
            subscriptionExpires: true,
            subscriptionId: true,
            isCancelling: true,
            customerId: true,
        }
    });

    if (!teacherData) {
        throw new Error('Teacher not found');
    }

    const decryptedTeacher = {
        image: teacherData.image,
        id: teacherData.id,
        isCancelling: teacherData.isCancelling,
        avatarURL: teacherData.avatarURL,
        accountType: teacherData.accountType,
        subscriptionExpires: teacherData.subscriptionExpires,
        customerId: teacherData.customerId,
        subscriptionId: teacherData.subscriptionId,
        email: teacherData.email,
        username: decryptText(teacherData.username as string, teacherData.iv as string),
        name: decryptText(teacherData.name as string, teacherData.iv as string),
    };

    return decryptedTeacher;
}


// Determine subscription allowance for adding prompts and classes
export async function determineSubscriptionAllowance(teacherId: string) {
    await requireAuth();

    const teacherInfo = await prisma.user.findUnique({
        where: { id: teacherId },
        select: {
            subscriptionExpires: true,
            accountType: true,
            _count: {
                select: {
                    classes: true,
                }
            }
        }
    });

    if (!teacherInfo) {
        throw new Error('Teacher not found');
    }

    // Determine if subscription is expired or not to render correct UI
    const today = new Date();
    const isSubscriptionActive = teacherInfo.subscriptionExpires ? teacherInfo.subscriptionExpires > today : false;
    const totalClasses = teacherInfo._count.classes;
    const isPremiumTeacher = isSubscriptionActive && teacherInfo.accountType === TeacherAccountType.PREMIUM;
    const isAllowedToMakeNewClass = isSubscriptionActive && totalClasses < 6 || totalClasses < 1;

    return { isSubscriptionActive, isAllowedToMakeNewClass, isPremiumTeacher };
}

export async function getTeacherSettingData(teacherId: string, classId: string) {
    const session = await requireAuth();
    if (session?.user?.id !== teacherId) {
        throw new Error('Forbidden');
    }

    const [teacherData, studentIdsArr, classInfo] = await Promise.all([
        prisma.user.findUnique({
            where: { id: teacherId },
            select: {
                username: true,
                name: true,
                iv: true,
                email: true,
                accountType: true,
                id: true,
                image: true,
                subscriptionExpires: true,
                subscriptionId: true,
                isCancelling: true,
                customerId: true,
            }
        }),

        prisma.classUser.findMany({
            where: {
                classId: classId,
                role: ClassUserRole.STUDENT
            },
            select: {
                userId: true,
            },
        }),

        prisma.classroom.findUnique({
            where: { id: classId },
            select: {
                _count: {
                    select: {
                        users: true,
                    }
                },
                id: true,
                classCode: true,
                subject: true,
                year: true,
                period: true,
                name: true,
                color: true,
                grade: true
            }
        })
    ]);

    if (!teacherData) {
        throw new Error('Teacher not found');
    }

    if (!classInfo) {
        throw new Error('Class not found');
    }

    // Return the teacher data with names decrypted and without iv string
    const teacher = {
        image: teacherData.image,
        id: teacherData.id,
        isCancelling: teacherData.isCancelling,
        accountType: teacherData.accountType,
        subscriptionExpires: teacherData.subscriptionExpires,
        customerId: teacherData.customerId,
        subscriptionId: teacherData.subscriptionId,
        email: teacherData.email,
        username: decryptText(teacherData.username as string, teacherData.iv as string),
        name: decryptText(teacherData.name as string, teacherData.iv as string),
    };

    const studentIds = studentIdsArr.map(student => student.userId);

    return { teacher, studentIds, classInfo };
}