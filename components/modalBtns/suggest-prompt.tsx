'use client'
import { Button } from '../ui/button'
import { ResponsiveDialog } from '../responsive-dialog'
import { useState } from 'react'
import SuggestPromptForm from '../forms/student-request/suggest-prompt-form'
import RequestNewUsernameForm from '../forms/student-request/request-new-username-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function SuggestPrompt({
    studentId,
    teacherId,
    hasSentPromptRequest,
    handleUIChange,
    classId,
    hasSentUsernameRequest
}: {
    studentId: string,
    teacherId: string,
    hasSentUsernameRequest: boolean;
    hasSentPromptRequest: boolean;
    handleUIChange: (type: "username" | "prompt") => void;
    classId: string
}) {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    function closeModal() {
        setIsModalOpen(false)
    }


    return (
        <>
            <ResponsiveDialog
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                title='Choose Request Type'
                description='Request a new username or suggest a blog prompt'
            >

                <Tabs defaultValue="username" className='mt-5' >
                    <TabsList>
                        <TabsTrigger value="username">Username</TabsTrigger>
                        <TabsTrigger value="blogPrompt">Blog Prompt</TabsTrigger>
                    </TabsList>
                    <TabsContent value="username">
                        {hasSentUsernameRequest ? (
                            <p className='text-destructive text-center mx-5 pb-5 mt-6'>You already have a pending request. You can only send one username request at a time</p>
                        ) : (
                            <RequestNewUsernameForm
                                studentId={studentId}
                                teacherId={teacherId}
                                closeModal={closeModal}
                                handleUIChange={handleUIChange}
                                classId={classId}
                            />
                        )}
                    </TabsContent>
                    <TabsContent value="blogPrompt">
                        {hasSentPromptRequest ? (
                            <p className='text-destructive text-center mx-5 pb-5 mt-6'>You already have a pending request. You can only send one prompt suggestion at a time</p>
                        ) : (
                            <SuggestPromptForm
                                studentId={studentId}
                                teacherId={teacherId}
                                closeModal={closeModal}
                                handleUIChange={handleUIChange}
                                classId={classId}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </ResponsiveDialog>











            <Button
                onClick={() => setIsModalOpen(true)}
            >
                Requests
            </Button>
        </>
    )
}
