"use client"
import BlogCard from '@/components/blog-card';
import Carousel from '@/components/carousel';
import RequestNewUsername from '@/components/modalBtns/request-new-username';
import SuggestPrompt from '@/components/modalBtns/suggest-prompt';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PromptCategory, PromptSession, StudentRequest, Response, ResponseData } from '@/types'
import Link from 'next/link';
import AssignmentSectionClient from './assignement-section.client';
import { useQuery } from '@tanstack/react-query';
import { getAllSessionsInClass } from '@/lib/actions/prompt.session.actions';
import { getFeaturedBlogs, getStudentRequests } from '@/lib/actions/student.dashboard.actions';
import { useState } from 'react';

export default function StudentDashClientWrapper({
  allCategories,
  allPromptSessions,
  featuredBlogs,
  studentRequests,
  studentId,
  teacherId,
  classroomId
}: {
  allCategories: PromptCategory[];
  allPromptSessions: { prompts: PromptSession[], totalCount: number };
  featuredBlogs: Response[],
  studentRequests: StudentRequest[],
  studentId: string;
  teacherId: string;
  classroomId: string
}) {


  // Get the prompt sessions
  const { data: allPromptSessionData } = useQuery({
    queryKey: ['getStudentDashPromptSession', classroomId],
    queryFn: () => getAllSessionsInClass(classroomId) as unknown as { prompts: PromptSession[], totalCount: number },
    initialData: allPromptSessions
  })

  // Get the student requests
  const { data: studentRequestData } = useQuery({
    queryKey: ['getStudentRequests', classroomId],
    queryFn: async () => {
      const requests = await getStudentRequests(studentId) as unknown as StudentRequest[]
      setHasSentPromptRequest(requests?.some(req => req.type === 'prompt'))
      setHasSentUsernameRequest(requests?.some(req => req.type === 'username'))
      return requests
    },
    initialData: studentRequests
  })

  // Get the Featured Blogs
  const { data: featuredBlogsData } = useQuery({
    queryKey: ['getFeaturedBlogs', classroomId],
    queryFn: () => getFeaturedBlogs(classroomId) as unknown as Response[],
    initialData: featuredBlogs
  })

  const [hasSentPromptRequest, setHasSentPromptRequest] = useState<boolean>(studentRequestData?.some(req => req.type === 'username'))
  const [hasSentUsernameRequest, setHasSentUsernameRequest] = useState<boolean>(studentRequestData?.some(req => req.type === 'prompt'))

  function handleRequestUIHandler(type: 'prompt' | 'username') {
    if (type === 'prompt') {
      setHasSentPromptRequest(true)
    } else if (type === 'username') {
      setHasSentUsernameRequest(true)
    }
  }

  const promptSessionWithMetaData = allPromptSessionData?.prompts?.map(session => {
    // Determine if assignment is completed
    const isCompleted = session?.responses?.some(response => response.studentId === studentId)
    let studentResponseId: string | null = null
    let isSubmittable: boolean = false;
    if (isCompleted) {
      // if completed, get their responseID so we can navigate them to their '/review-reponse/${responseID}'
      const { id, isSubmittable: isReturned } = session?.responses?.find(res => res.studentId === studentId) as unknown as Response
      studentResponseId = id;
      isSubmittable = isReturned
    }
    // Add fields is completed, and their specific responseID to the promptSession
    return ({
      ...session,
      isCompleted,
      isSubmittable,
      studentResponseId,
    })
  }) as unknown as PromptSession[]

  const lastestTaskToDo = promptSessionWithMetaData.find(session => !session.isCompleted)

  return (
    <>
      {lastestTaskToDo && (
        <div
          className="border border-primary w-full px-5 py-2 rounded-lg relative mb-10"
        >
          <div className="flex-between">
            <div>
              <p className="h3-bold text-primary">Alert! New Assignment</p>
              <p className="text-md line-clamp-1">{lastestTaskToDo?.title}</p>
              <p className="text-sm text-ring">{lastestTaskToDo?.prompt?.category?.name}</p>
            </div>
            <Button asChild variant='secondary' className="text-secondary-foreground">
              <Link href={`jot-response/${lastestTaskToDo?.id}?q=0`}>
                Complete
              </Link>
            </Button>
          </div>
        </div>
      )}
      <section>
        <div className="flex-end space-x-5 relative">
          <RequestNewUsername
            studentId={studentId}
            teacherId={teacherId}
            handleUIChange={handleRequestUIHandler}
            hasSentUsernameRequest={hasSentUsernameRequest}
          />
          <SuggestPrompt
            studentId={studentId}
            teacherId={teacherId}
            handleUIChange={handleRequestUIHandler}
            hasSentPromptRequest={hasSentPromptRequest}
          />
        </div>
        <h3 className="h3-bold ml-1">Featured Blogs</h3>
        {featuredBlogsData?.length > 0 ? (
          <Carousel>
            {featuredBlogsData.map((response) => (
              <Link
                key={response?.id}
                href={`/discussion-board/${response?.promptSession?.id}/response/${response?.id}`}
                className="embla__slide hover:shadow-[0_4px_10px_-3px_var(--secondary)] mx-5">
                <BlogCard
                  likeCount={response?.likeCount as number}
                  author={response?.student?.username as string}
                  totalCommentCount={response?._count?.comments as number}
                  title={(response?.response as unknown as ResponseData[])?.[1].answer as string}
                  description={(response?.response as unknown as ResponseData[])?.[0].answer as string}
                  // date={formatDateShort(response?.submittedAt as Date)}
                  coverPhotoUrl={(response?.response as unknown as ResponseData[])?.[2].answer as string}
                />
              </Link>
            ))}
          </Carousel>
        ) : (
          <p className="text-center text-lg font-bold">No Featured Blogs</p>
        )}
      </section>
      <Separator className="mt-20 mb-10" />
      <section>
        <h3 className="h3-bold mb-2 ml-1">Assignments</h3>
        <AssignmentSectionClient
          initialPrompts={promptSessionWithMetaData}
          promptCountTotal={allPromptSessionData?.totalCount}
          categories={allCategories}
          studentId={studentId}
        />
      </section>
    </>
  )
}
