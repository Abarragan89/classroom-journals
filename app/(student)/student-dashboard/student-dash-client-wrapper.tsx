"use client"
import BlogCard from '@/components/blog-card';
import Carousel from '@/components/carousel';
import SuggestPrompt from '@/components/modalBtns/suggest-prompt';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PromptCategory, StudentRequest, Response, ResponseData } from '@/types'
import Link from 'next/link';
import AssignmentSectionClient from './assignement-section.client';
import { useState, useMemo } from 'react';
import { formatDateLong } from '@/lib/utils';
import QuipLink from './quip-link';

export default function StudentDashClientWrapper({
  allCategories,
  allResponses,
  featuredBlogs,
  studentRequests,
  studentId,
  teacherId,
  classroomId,
  quipAlerts,
}: {
  allCategories: PromptCategory[];
  allResponses: { responses: Response[], totalCount: number },
  featuredBlogs: Response[],
  studentRequests: StudentRequest[],
  studentId: string;
  teacherId: string;
  classroomId: string;
  quipAlerts: number;
}) {

  // Initialize state from server-fetched data
  const [hasSentPromptRequest, setHasSentPromptRequest] = useState<boolean>(
    studentRequests?.some((req: StudentRequest) => req.type === 'PROMPT') ?? false
  );
  const [hasSentUsernameRequest, setHasSentUsernameRequest] = useState<boolean>(
    studentRequests?.some((req: StudentRequest) => req.type === 'USERNAME') ?? false
  );

  // Memoize computed values for performance
  const lastestTaskToDo = useMemo(
    () => allResponses?.responses.find(
      res => res.completionStatus === 'INCOMPLETE' || res.completionStatus === 'RETURNED'
    ),
    [allResponses?.responses]
  );

  function handleRequestUIHandler(type: "username" | "prompt") {
    if (type === "prompt") {
      setHasSentPromptRequest(true);
    } else if (type === "username") {
      setHasSentUsernameRequest(true);
    }
  }

  return (
    <>
      {lastestTaskToDo && (
        <div
          className="border border-primary bg-card shadow-lg w-full px-5 py-2 rounded-lg relative mb-16 mt-2"
        >
          <div className="flex-between">
            <div>
              <p className="h3-bold text-primary">Alert! New Assignment</p>
              <p className="text-md line-clamp-1">{lastestTaskToDo?.promptSession?.title}</p>
              <p className="text-sm text-ring">{lastestTaskToDo?.promptSession?.prompt?.category?.name}</p>
            </div>
            <Button asChild className='bg-success text-success-foreground'>
              <Link href={`jot-response/${lastestTaskToDo?.id}?q=0`}>
                Complete
              </Link>
            </Button>
          </div>
        </div>
      )}
      <section>
        <div className="flex-end space-x-5 relative -top-5 mt-5">
          <QuipLink
            quipAlerts={quipAlerts}
          />
          <Button asChild>
            <Link href={'/typing-test'}>
              Typing Test
            </Link>
          </Button>

          <SuggestPrompt
            studentId={studentId}
            teacherId={teacherId}
            handleUIChange={handleRequestUIHandler}
            hasSentUsernameRequest={hasSentUsernameRequest}
            hasSentPromptRequest={hasSentPromptRequest}
            classId={classroomId}
          />
        </div>
        {featuredBlogs?.length > 0 && (
          <>
            <h3 className="h2-bold ml-1 mb-2">Most Popular</h3>
            <Carousel>
              {featuredBlogs.map((response) => (
                <Link
                  key={response?.id}
                  href={`/discussion-board/${response?.promptSession?.id}/response/${response?.id}`}
                  className="embla__slide mx-5 rounded-md shadow-lg border hover:border-primary transition-all">
                  <BlogCard
                    likeCount={response?.likeCount as number}
                    author={response?.student?.username as string}
                    date={formatDateLong(response?.submittedAt)}
                    totalCommentCount={response?._count?.comments as number}
                    title={(response?.response as unknown as ResponseData[])?.[1].answer as string}
                    description={(response?.response as unknown as ResponseData[])?.[0].answer as string}
                    coverPhotoUrl={(response?.response as unknown as ResponseData[])?.[2].answer as string}
                  />
                </Link>
              ))}
            </Carousel>
            <Separator className="my-14" />
          </>
        )}
      </section>
      <section>
        <h3 className="h2-bold mb-2 ml-1">Assignments</h3>
        <AssignmentSectionClient
          initialPrompts={allResponses?.responses}
          promptCountTotal={allResponses?.totalCount}
          categories={allCategories}
          studentId={studentId}
        />
      </section>
    </>
  )
}
