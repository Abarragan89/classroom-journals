import { z } from "zod";
import { classSchema, promptSchema, rubricSchema } from "@/lib/validators";
import { JsonValue } from "@prisma/client/runtime/library";

export type User = {
    id: string;
    name?: string;
    username?: string,
    googleId?: string;
    password?: string;
    accountType?: string;
    isAdmin?: boolean;
    wpmSpeed?: number;
    iv?: string;
    avatarURL?: string;
    email?: string;
    emailVerified?: Date;
    image?: string;
    classCode: string;
    role: "TEACHER" | "STUDENT" | "ADMIN";
    createdAt: Date;
    updatedAt: Date;
    subscriptionId: string;
    customerId: string;
    subscriptionExpires: Date
    commentCoolDown: number;
    isCancelling: boolean
};

export type Class = z.infer<typeof classSchema> & {
    id: string;
    classCode: string;
    _count?: { users: number }
}
// This is needed for the form data that does not include Id
export type ClassForm = Omit<Class, "id">;

export interface Classroom {
    id: string;
    name: string,
    classCode?: string;
    _count?: { users: number }
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
    category: PromptCategory;
    updatedAt: Date;
    teacherId: string;
    classes?: Classroom[]
    promptSession?: PromptSession[];
}

export type PromptSession = {
    id: string;
    promptId: string | null;
    title: string;
    questions: JsonValue | Question[];
    assignedAt: Date;
    isPublic: boolean;
    promptType: string;
    studentResponseId?: string;
    authorId?: string;
    author?: User;
    category: PromptCategory;
    prompt?: Prompt;
    areGradesVisible: boolean;
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
    likes: ResponseLike[];
    likeCount: number;
    blogImage?: string;
    completionStatus: 'INCOMPLETE' | 'COMPLETE' | 'RETURNED';
    spellCheckEnabled: boolean;
    studentId: string;
    _count: { comments: number }
    response: JsonValue;
    promptSession?: PromptSession;
    score: number;
    comments: ResponseComment[];
    isSubmittable: boolean;
    submittedAt: Date;
    createdAt: Date;
    student: User;
}

export interface ResponseData {
    answer: string;
    question: string;
    score: number;
}

export interface SearchOptions {
    category: string;
    filter: string;
    paginationSkip: number,
    searchWords: string
    status?: string
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

export interface ResponseLike {
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

export interface UserNotification {
    id: string;
    userId: string;
    responseId: string;
    url: string;
    message: string;
    commentText?: string;
    user: User;
    response: Response;
    createdAt: Date;
    isRead: boolean;
}

export interface PromptCategory {
    id: string;
    name: string;
    userId?: string;
    user?: User;
    prompts?: Prompt[];
}

export interface StudentRequest {
    id: string;
    studentId: string;
    teacherId: string;
    type: string; // 'username' or 'prompt'
    text: string;
    createdAt: Date;
    status: string;
    student: User;
    teacher: User;
    displayText?: string
}

export interface SubscriptionData {
    name: string;
    price: number;
    description: string;
    frequency: string;
    listItems: string[];
    payoutLink: string;
    teacherEmail: string;
}

export interface BlogImage {
    id?: string;
    url: string;
    category: string;
    tags: string[];
    createdAt?: Date;
}

export type Rubric = z.infer<typeof rubricSchema> & {
    id: string;
    teacherId: string;
    createdAt: Date;
    updatedAt: Date;
}

export type RubricFormData = z.infer<typeof rubricSchema>

// Type for lightweight rubric list items (only id and title)
export type RubricListItem = {
    id: string;
    title: string;
    createdAt: Date;
}

// Type for rubric instance used in grading
export type RubricGradingInstance = {
    id: string;
    title: string;
    categories: {
        name: string;
        criteria: {
            description: string;
            score: number;
        }[];
        selectedScore?: number; // The currently selected score for this category
    }[];
}

// Type for saving rubric grades (This is what we save to the database)
export type RubricGrade = {
    rubricId: string;
    responseId: string;
    categories: {
        name: string;
        selectedScore: number;
        maxScore: number;
    }[];
    totalScore: number;
    maxTotalScore: number;
}



