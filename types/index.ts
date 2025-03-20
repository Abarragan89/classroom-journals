import { z } from "zod";
import { classSchema, promptSchema } from "@/lib/validators";
import { JsonValue } from "@prisma/client/runtime/library";

export type User = {
    id: string;
    name?: string;
    username?: string,
    googleId?: string;
    password?: string;
    iv?: string;
    email?: string;
    emailVerified?: Date;
    image?: string;
    classCode: string;
    role: "teacher" | "student";
    createdAt: Date;
    updatedAt: Date;
    // classes: ClassUser[];
};

export type Class = z.infer<typeof classSchema> & {
    id: string;
    classCode: string;
    // users?: ClassUser[]
}
// This is needed for the form data that does not include Id
export type ClassForm = Omit<Class, "id">;

// export type ClassUser = {
//     userId: string;
//     classId: string;
//     role: "teacher" | "student";
//     user: User;
//     class: Class;
// }

export interface Classroom {
    id: string;
    name: string,
    classCode?: string;
    color?: string;
    subject?: string | null;
    year?: string | null;
    period?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface Question {
    question: string;
    answer?: string;
    score?: number;
}
export type Prompt = z.infer<typeof promptSchema> & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    teacherId: string;
    classes?: Classroom[]
    promptSession?: PromptSession[];

}

export type PromptSession = {
    id: string;
    promptId: string | null;
    title: string;
    questions: Question[] | JsonValue;
    assignedAt: Date;
    promptType: string;
    prompt?: Prompt;
    classId: string;
    status: string;
    responses?: Response[];
    class?: Classroom;
    createdAt: Date;
    updatedAt: Date;
};

export interface Response {
    id: string;
    promptSessionId: string;
    studentId: string;
    response: JsonValue;
    promptSession?: PromptSession;
    score: number;
    comments: ResponseComment[]
    submittedAt: Date;
    student: User;
}

export interface ResponseData {
    answer: string;
    question: string;
    score: number;
}

export interface SearchOptions {
    classroom: string;
    filter: string;
    paginationSkip: number,
    searchWords: string
}


// google classroom type 
export type GoogleClassroom = {
    id: string;
    name: string;
    section: string;
    room: string;
    ownerId: string;
    creationTime: string; // ISO date string
    updateTime: string; // ISO date string
    enrollmentCode: string;
    courseState: "ACTIVE" | "ARCHIVED" | "PROVISIONED" | "DECLINED"; // Based on Google Classroom API
    alternateLink: string;
    teacherGroupEmail: string;
    courseGroupEmail: string;
};


export interface Session {
    user: User;
    expires: string; // ISO date string
    googleProviderId: string;
    accessToken: string;
    accessTokenExpires: number;
    refreshToken: string;
    iv: string;
    classroomId?: string;
}

export interface CommentLike {
    id: string;
    userId: string;
    commentId: string;
}

export interface ResponseComment {
    id: string;
    text: string;
    likeCount: number;
    createdAt: Date;
    likes: CommentLike[];
    userId: string;
    responseId: string;
    parentId?: string | null;
    user: User;
    response: Response;
    parent?: Comment | null;
    replies: ResponseComment[];
};