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

export default function AnswerQuip({
    studentId,
    promptSessionId,
    quipQuestion,
    completeStatusTrue
}: {
    studentId: string;
    promptSessionId: string;
    quipQuestion: string;
    completeStatusTrue: () => void;
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

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const responseData = [{ question: quipQuestion, answer: values.responseText, score: 0 }]
            await respondToQuip(responseData, studentId, promptSessionId)
            completeStatusTrue();
            toast('Response Posted')
        } catch (error) {
            console.log('erroring making new quip', error)
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
