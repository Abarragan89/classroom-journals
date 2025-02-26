import { z } from "zod";
import { createClassSchema } from "@/lib/validators";

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
    classes: ClassUser[];
};

export type Class = z.infer<typeof createClassSchema> & {
    id: string;
    users?: ClassUser[]
}
// This is needed for the form data that does not include Id
export type ClassForm = Omit<Class, "id">;

export type ClassUser = {
    userId: string;
    classId: string;
    role: "teacher" | "student"; // Ensuring only "teacher" or "student"
    user: User;
    class: Class;
}