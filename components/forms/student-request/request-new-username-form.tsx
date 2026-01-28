import React, { useState } from 'react'
import { requestNewUsernameSchema } from '@/lib/validators'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createStudentRequest } from '@/lib/actions/student-request'
import { toast } from 'sonner'

export default function RequestNewUsernameForm({
    studentId,
    teacherId,
    closeModal,
    handleUIChange,
    classId
}: {
    studentId: string,
    teacherId: string,
    closeModal: () => void,
    handleUIChange: (type: "username" | "prompt") => void;
    classId: string
}) {
    const form = useForm<z.infer<typeof requestNewUsernameSchema>>({
        resolver: zodResolver(requestNewUsernameSchema),
        defaultValues: {
            notificationText: "",
        },
    })

    const [isSendingRequest, setIsSendingRequest] = useState<boolean>(false)

    async function onSubmit(values: z.infer<typeof requestNewUsernameSchema>) {
        try {
            setIsSendingRequest(true)
            const response = await createStudentRequest(studentId, teacherId, values.notificationText, 'USERNAME', classId);
            if (!response.success) {
                throw new Error('error making new username request')
            }
            closeModal();
            toast('Request has been sent!')
            // sets the request pending to true to block user from sending multiple requests
            handleUIChange('username')
        } catch (error) {
            console.error('error sending request for new user name ', error)
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
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder='Request new username'
                                    maxLength={20}
                                    onChange={(e) => field.onChange(e.target.value.replace(/\s/g, ''))}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                >
                </FormField>
                <div className="flex-center mt-5">
                    <Button
                        disabled={isSendingRequest}
                        className='mt-4'
                        type="submit">
                        Send Request
                    </Button>
                </div>
            </form>
        </Form>
    )
}
