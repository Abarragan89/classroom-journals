"use client"
import { respondToQuip } from "@/lib/actions/quips.action";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PromptSession, Response } from "@/types";

export default function AnswerQuip({
    studentId,
    promptSessionId,
    quipQuestion,
    classId,
}: {
    studentId: string;
    promptSessionId: string;
    quipQuestion: string;
    classId: string;
}) {

    const formSchema = z.object({
        responseText: z.string().min(2),

    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            responseText: "",
        },
    })

    const queryClient = useQueryClient();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const responseData = [{ question: quipQuestion, answer: values.responseText, score: 0 }]
            const createdResponse = await respondToQuip(responseData, studentId, promptSessionId)

            if (createdResponse && typeof createdResponse === 'object' && 'id' in createdResponse) {
                queryClient.setQueryData<Response[]>(['quipResponses', promptSessionId], (old) =>
                    old ? [...old, createdResponse as Response] : [createdResponse as Response]
                )

                queryClient.setQueryData<PromptSession[]>(['getAllQuips', classId], (old) => {
                    if (!old) return old
                    return old.map((quip) =>
                        quip.id === promptSessionId
                            ? ({
                                ...quip,
                                responses: [...(quip.responses || []), { studentId } as unknown as Response]
                            } as PromptSession)
                            : quip
                    )
                })
            }

            toast('Response Posted')
        } catch (error) {
            console.error('erroring making new quip', error)
        }
    }
    return (
        <Form {...form}>
            <form className="flex flex-col justify-center" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="responseText"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea
                                    rows={3}
                                    placeholder="Your response..." {...field}
                                    onPaste={(e) => e.preventDefault()}
                                    onCopy={(e) => e.preventDefault()}
                                    onCut={(e) => e.preventDefault()}
                                    onDrop={(e) => e.preventDefault()}
                                    onDragOver={(e) => e.preventDefault()}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    disabled={form.formState.isSubmitting}
                    className="mt-4" type="submit">
                    {form.formState.isSubmitting ? "Submitting..." : "Submit Response"}
                </Button>
            </form>
        </Form>
    )
}
