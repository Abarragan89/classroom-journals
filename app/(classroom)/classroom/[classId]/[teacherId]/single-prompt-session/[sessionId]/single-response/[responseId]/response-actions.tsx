'use client'
import { useQuery } from '@tanstack/react-query'
import { Response } from '@/types'
import HandleToggleReturnStateBtn from '@/components/buttons/handle-toggle-return-state-btn'
import DeleteResponseBtn from './delete-response-btn'
// import { Badge } from '@/components/ui/badge'

export default function ResponseActions({
    initialResponse,
    responseId,
    sessionId,
    teacherId,
    classId
}: {
    initialResponse: Response,
    responseId: string,
    sessionId: string,
    teacherId: string,
    classId: string
}) {
    // Read from cache - will update when mutation updates it
    const { data: response } = useQuery({
        queryKey: ['response', responseId],
        queryFn: async () => {
            // This won't actually run on mount since we have initialData
            return initialResponse;
        },
        initialData: initialResponse,
        staleTime: Infinity,
    });

    // const isNotSubmitted = response?.completionStatus !== 'COMPLETE';

    return (
        <div className='relative mb-1'>
            <div className='flex gap-x-4 justify-end'>
                <HandleToggleReturnStateBtn
                    responseId={responseId}
                    teacherId={teacherId}
                    isCompleted={response?.completionStatus === 'COMPLETE'}
                    sessionId={sessionId}
                />
                <DeleteResponseBtn
                    responseId={responseId}
                    sessionId={sessionId}
                    teacherId={teacherId}
                    classId={classId}
                />
            </div>
            {/* {isNotSubmitted && (
                <Badge variant={"destructive"}  className='absolute -top-8 right-0 font-bold text-xs'>Not Submitted</Badge>
            )} */}
        </div>
    );
}
