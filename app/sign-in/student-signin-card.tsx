import { Card, CardHeader } from '@/components/ui/card'
import { CardContent } from '@/components/ui/card'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export default function StudentSignInCard({ changeTab }: { changeTab: () => void }) {
    return (
        <Card>
            <CardHeader className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger onClick={changeTab} value="teacher-sign-in">Educators</TabsTrigger>
                    <TabsTrigger value="student-sign-in">Students</TabsTrigger>
                </TabsList>
            </CardHeader>
            <CardContent className="mt-4 space-y-5">
                <div>
                    <Label htmlFor='class-code'>
                        Class Code:
                    </Label>
                    <Input
                        type='text'
                        id='class-code'
                        name='class=-code'
                        className='col-span-3'
                    />
                </div>
                <div>
                    <Label htmlFor='class-code'>
                        Password:
                    </Label>
                    <Input
                        type='text'
                        id='class-code'
                        name='class=-code'
                        className='col-span-3'
                    />
                </div>
            </CardContent>
        </Card>
    )
}
