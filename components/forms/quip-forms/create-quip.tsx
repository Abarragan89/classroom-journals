"use client"
import { createNewQuip } from "@/lib/actions/quips.action";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner";
import { PromptSession } from "@/types";
import { useQueryClient } from "@tanstack/react-query";


export default function CreateQuipForm({
    classId,
    teacherId,
    closeModal,
}: {
    classId: string;
    teacherId: string;
    closeModal: () => void;
}) {

    const formSchema = z.object({
        qiupText: z.string().min(2),
        classId: z.string().min(2),
        teacherId: z.string().min(2)
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            qiupText: "",
            classId,
            teacherId,
        },
    })

    const queryClient = useQueryClient();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const newQuip = await createNewQuip(values.qiupText, values.classId, values.teacherId) as PromptSession
            queryClient.setQueryData<PromptSession[]>(['getAllQuips', classId], old => [
                newQuip,
                ...(old || []),
            ]);
            closeModal();
            toast('Quip Posted!')
        } catch (error) {
            console.log('erroring making new quip', error)
        }
    }

    return (
        <Form {...form}>
            <form className="flex flex-col justify-center" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="qiupText"
                    render={({ field }) => (
                        <FormItem>
                            <FormDescription className="text-xs">
                                Quips are quick questions to post in your class. Not graded, always public.
                            </FormDescription>
                            <FormControl>
                                <Textarea
                                    rows={4}
                                    placeholder="New Quip..." {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    disabled={form.formState.isSubmitting}
                    className="mt-4" type="submit">
                    {form.formState.isSubmitting ? "Posting..." : "Post Quip"}
                </Button>
            </form>
        </Form>
    )
}
