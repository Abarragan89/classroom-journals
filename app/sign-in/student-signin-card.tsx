'use client'
import { useState } from 'react'
import { Card, CardHeader } from '@/components/ui/card'
import { CardContent } from '@/components/ui/card'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input';
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function StudentSignInCard({ changeTab }: { changeTab: () => void }) {

    const router = useRouter();

    const [classCode, setClassCode] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('') // Clear errors

        const result = await signIn('credentials', {
            classCode,
            password,
            redirect: false,
            redirectTo: '/'
        })

        if (result?.error) {
            setError('Invalid class code or password')
        } else {
            // Redirect the student to the dashboard after successful login
            router.push(`/student-dashboard/`)
        }
    }
    return (
        <Card>
            <CardHeader className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger onClick={changeTab} value="teacher-sign-in">Educators</TabsTrigger>
                    <TabsTrigger value="student-sign-in">Students</TabsTrigger>
                </TabsList>
            </CardHeader>
            <CardContent className="mt-2 ">
                <form onSubmit={handleSignIn} className='space-y-5' >
                    <div>
                        <Label htmlFor='class-code'>
                            Class Code:
                        </Label>
                        <Input
                            type='text'
                            id='class-code'
                            name='class-code'
                            className='col-span-3'
                            onChange={(e) => setClassCode(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor='password'>
                            Password:
                        </Label>
                        <Input
                            type='password'
                            id='password'
                            name='password'
                            className='col-span-3'
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    <Button type="submit">Sign In</Button>
                </form>
            </CardContent>
        </Card>
    )
}
