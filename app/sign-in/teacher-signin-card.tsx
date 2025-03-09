import { Card, CardContent, CardHeader } from '@/components/ui/card'
import GoogleButton from '@/components/auth/google-button'
import MagicLink from '@/components/auth/magic-link'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'


export default function TeacherSignInCard({ changeTab }: { changeTab: () => void }) {

    return (
        <Card>
            <CardHeader className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="teacher-sign-in">Educators</TabsTrigger>
                    <TabsTrigger onClick={changeTab} value="student-sign-in">Students</TabsTrigger>
                </TabsList>
            </CardHeader>
            <CardContent className='mt-5'>
                <GoogleButton />
                <p className="my-4 text-center relative">
                    <span className="relative z-10 bg-card px-3">or</span>
                    <span className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 border-t border-gray-500"></span>
                </p>
                <MagicLink />
            </CardContent>
        </Card>
    )
}
