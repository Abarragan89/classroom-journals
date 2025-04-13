import React from 'react'
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
    closeModal
}: {
    studentId: string,
    teacherId: string,
    closeModal: () => void
}) {
    const form = useForm<z.infer<typeof requestNewUsernameSchema>>({
        resolver: zodResolver(requestNewUsernameSchema),
        defaultValues: {
            notificationText: "",
        },
    })

    async function onSubmit(values: z.infer<typeof requestNewUsernameSchema>) {
        try {
            const response = await createStudentRequest(studentId, teacherId, values.notificationText, 'username');
            if (!response.success) {
                throw new Error('error making new username request')
            }
            closeModal();
            toast('Request has been sent!')
        } catch (error) {
            console.log('error sending request for new user name ', error)
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
                                <Input
                                    {...field}
                                    placeholder='new username'
                                    maxLength={20}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                >
                </FormField>
                <div className="flex-center">
                    <Button className='mt-4' type="submit">Send</Button>
                </div>
            </form>
        </Form>
    )
}
