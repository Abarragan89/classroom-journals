import { z } from "zod";
import { classSchema, promptSchema } from "@/lib/validators";
import { JsonValue } from "@prisma/client/runtime/library";

export type User = {
    id: string;
    name?: string;
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
    promptId: string;
    title: string;
    questions: JsonValue;
    assignedAt: Date;
    classId: string;
    status: string;
    responses?: Response[]; // Assuming 'Response' is a model type you're using
    class?: Classroom;
    createdAt: Date;
    updatedAt: Date;
};

export interface SearchOptions {
    classroom: string;
    filter: string;
    paginationSkip: number,
    searchWords: string
}