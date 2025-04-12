import React from 'react'
import { requestNewUsernameSchema } from '@/lib/validators'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from 'zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'


export default function RequestNewUsernameForm() {
    const form = useForm<z.infer<typeof requestNewUsernameSchema>>({
        resolver: zodResolver(requestNewUsernameSchema),
        defaultValues: {
            username: "",
        },
    })

    function onSubmit(values: z.infer<typeof requestNewUsernameSchema>) {
        try {
            
        } catch (error) {
            console.log('error sending request for new user name ', error)
        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder='new username' {...field} />
                            </FormControl>
                            <FormDescription className=''>
                                Request you name be changed
                            </FormDescription>
                        </FormItem>
                    )}
                >
                </FormField>
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}
