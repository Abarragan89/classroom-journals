import { z } from "zod";
import { classSchema, promptSchema } from "@/lib/validators";

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

export interface ClassroomIds {
    id: string;
    name: string
}

export type Prompt = z.infer<typeof promptSchema> & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SearchOptions {
    classroom: string;
    filter: string;
    paginationSkip: number,
    searchWords: string
}