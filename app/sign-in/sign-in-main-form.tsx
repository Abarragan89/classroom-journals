'use client'
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useState } from "react"
import TeacherSignInCard from "./teacher-signin-card"
import StudentSignInCard from "./student-signin-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function SignInMainForm() {

    const [defaultValueTab, setDefaultValueTab] = useState<string>('')
    function changeToStudentLogin() {
        setDefaultValueTab('student-sign-in')
    }
    function changeToTeacherLogin() {
        setDefaultValueTab('teacher-sign-in')
    }

    return (
        <Tabs value={defaultValueTab as string} defaultValue={defaultValueTab as string}>
            {defaultValueTab !== '' ?
                <>
                    <TabsContent value="teacher-sign-in">
                        <TeacherSignInCard
                            changeTab={changeToStudentLogin}
                        />
                    </TabsContent>
                    <TabsContent value="student-sign-in">
                        <StudentSignInCard
                            changeTab={changeToTeacherLogin}
                        />
                    </TabsContent>
                </>
                :
                <Card className="p-5">
                    <p className="text-center mb-2 font-bold">Choose your role:</p>
                    <div className="flex flex-col justify-center items-center space-y-5">
                        <Button className="w-[90%] mx-auto" onClick={() => setDefaultValueTab('teacher-sign-in')}>Educator</Button>
                        <Button className="w-[90%] mx-auto" onClick={() => setDefaultValueTab('student-sign-in')}>Student</Button>
                    </div>
                </Card>
            }
        </Tabs>
    )
}
