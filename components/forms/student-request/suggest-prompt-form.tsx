import React, { useState } from 'react'
import { requestNewPromptSchema } from '@/lib/validators'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { createStudentRequest } from '@/lib/actions/student-request'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'

export default function SuggestPromptForm({
    studentId,
    teacherId,
    closeModal,
    requestSentUIHandler
}: {
    studentId: string,
    teacherId: string,
    closeModal: () => void,
    requestSentUIHandler: () => void
}) {
    const form = useForm<z.infer<typeof requestNewPromptSchema>>({
        resolver: zodResolver(requestNewPromptSchema),
        defaultValues: {
            notificationText: "",
        },
    })

    const [isSendingRequest, setIsSendingRequest] = useState<boolean>(false)

    async function onSubmit(values: z.infer<typeof requestNewPromptSchema>) {
        try {
            setIsSendingRequest(true)
            const response = await createStudentRequest(studentId, teacherId, values.notificationText, 'prompt');
            if (!response.success) {
                throw new Error('error making new username request')
            }
            closeModal();
            toast('Request has been sent!')
            // sets the request pending to true to block user from sending multiple requests
            requestSentUIHandler()
        } catch (error) {
            console.log('error sending request for new user name ', error)
        } finally {
            setIsSendingRequest(false)
        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="notificationText"
                    render={({ field }) => (
                        <FormItem>
                            {/* <FormDescription className=''>
                                Request you name be changed
                            </FormDescription> */}
                            {/* <FormLabel>Username</FormLabel> */}
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder='enter a blog prompt'
                                />
                            </FormControl>
                        </FormItem>
                    )}
                >
                </FormField>
                <div className="flex-center">
                    <Button
                        disabled={isSendingRequest}
                        className='mt-4'
                        type="submit">
                        Send</Button>
                </div>
            </form>
        </Form>
    )
}
