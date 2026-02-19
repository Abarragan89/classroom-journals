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
        <div className="relative w-full mb-16 mt-2 overflow-hidden rounded-xl border-2 border-primary bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 shadow-xl">
          <div className="p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                {/* Alert icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="text-xl font-bold text-primary mb-1">New Assignment Alert!</p>
                  <p className="text-base font-semibold text-foreground line-clamp-1 mb-1">
                    {lastestTaskToDo?.promptSession?.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {lastestTaskToDo?.promptSession?.prompt?.category?.name}
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                asChild
                className="bg-success hover:bg-success/90 text-success-foreground shadow-md w-full sm:w-auto"
                size="lg"
              >
                <Link href={`jot-response/${lastestTaskToDo?.id}?q=0`}>
                  Complete Now →
                </Link>
              </Button>
            </div>
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
